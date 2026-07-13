import uuid
from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_plan_request_model import LeavePlanRequest
from app.leave_models.leave_request_model import LeaveRequest
from app.leave_models.presentable_model import LeaveTypePresentable, UserPresentable
from app.leave_models.public_holiday_model import PublicHoliday, PublicHolidayPublic

router = APIRouter(prefix="/schedule", tags=["schedule"])


class ScheduleTeamLeaveEntry(SQLModel):
    id: uuid.UUID
    source: str  # "leave_request" | "leave_plan_request"
    owner: UserPresentable
    leave_type: LeaveTypePresentable
    start_date: date
    end_date: date


class SchedulePublic(SQLModel):
    year: int
    month: int
    public_holidays: list[PublicHolidayPublic]
    team_leave: list[ScheduleTeamLeaveEntry]


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    month_start = date(year, month, 1)
    if month == 12:
        next_month_start = date(year + 1, 1, 1)
    else:
        next_month_start = date(year, month + 1, 1)
    month_end = next_month_start - timedelta(days=1)
    return month_start, month_end


@router.get("/", response_model=SchedulePublic)
def get_schedule(
    session: SessionDep,
    current_user: CurrentUser,
    year: int,
    month: int,
) -> Any:
    """
    Public holidays for the given month, plus the caller's team's approved
    leave (both LeaveRequest ranges and LeavePlanRequest per-day details,
    unified into one flat team_leave list). Empty team_leave (not an error)
    if the caller has no team.
    """

    if month < 1 or month > 12:
        raise HTTPException(status_code=422, detail="month must be between 1 and 12")

    month_start, month_end = _month_bounds(year, month)
    month_prefix = f"{year:04d}-{month:02d}"

    holidays = session.exec(
        select(PublicHoliday).where(PublicHoliday.date.like(f"{month_prefix}%"))
    ).all()

    team_leave: list[ScheduleTeamLeaveEntry] = []

    if current_user.team_id is not None:
        leave_requests = session.exec(
            select(LeaveRequest).where(
                LeaveRequest.team_id == current_user.team_id,
                LeaveRequest.status == "approved",
                LeaveRequest.start_date <= month_end,
                LeaveRequest.end_date >= month_start,
            )
        ).all()

        for row in leave_requests:
            team_leave.append(
                ScheduleTeamLeaveEntry(
                    id=row.id,
                    source="leave_request",
                    owner=UserPresentable.model_validate(row.owner),
                    leave_type=LeaveTypePresentable.model_validate(row.leave_type),
                    start_date=row.start_date,
                    end_date=row.end_date,
                )
            )

        leave_plan_requests = session.exec(
            select(LeavePlanRequest).where(
                LeavePlanRequest.team_id == current_user.team_id,
                LeavePlanRequest.status == "approved",
            )
        ).all()

        for row in leave_plan_requests:
            for detail in row.details:
                if month_start <= detail.leave_date <= month_end:
                    team_leave.append(
                        ScheduleTeamLeaveEntry(
                            id=row.id,
                            source="leave_plan_request",
                            owner=UserPresentable.model_validate(row.owner),
                            leave_type=LeaveTypePresentable.model_validate(
                                row.leave_type
                            ),
                            start_date=detail.leave_date,
                            end_date=detail.leave_date,
                        )
                    )

    return SchedulePublic(
        year=year,
        month=month,
        public_holidays=holidays,
        team_leave=team_leave,
    )
