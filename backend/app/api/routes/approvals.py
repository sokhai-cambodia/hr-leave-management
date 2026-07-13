from typing import Any

from fastapi import APIRouter
from sqlmodel import SQLModel, func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_plan_request_model import LeavePlanRequest
from app.leave_models.leave_request_model import LeaveRequest

router = APIRouter(prefix="/approvals", tags=["approvals"])


class PendingApprovalsCount(SQLModel):
    leave_requests: int
    leave_plan_requests: int
    total: int


@router.get("/pending-count", response_model=PendingApprovalsCount)
def pending_count(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Count of pending items assigned to the current user as approver, across
    both leave requests and leave plan requests. Cheap count-only query, no
    row hydration - for a nav badge, not the queue itself (GET
    /leave-requests/?approver_id=<id>&status=pending covers the full list).
    """

    leave_requests_count = session.exec(
        select(func.count())
        .select_from(LeaveRequest)
        .where(
            LeaveRequest.approver_id == current_user.id,
            LeaveRequest.status == "pending",
        )
    ).one()

    leave_plan_requests_count = session.exec(
        select(func.count())
        .select_from(LeavePlanRequest)
        .where(
            LeavePlanRequest.approver_id == current_user.id,
            LeavePlanRequest.status == "pending",
        )
    ).one()

    return PendingApprovalsCount(
        leave_requests=leave_requests_count,
        leave_plan_requests=leave_plan_requests_count,
        total=leave_requests_count + leave_plan_requests_count,
    )
