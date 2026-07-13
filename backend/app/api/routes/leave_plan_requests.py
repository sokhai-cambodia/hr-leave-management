import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_plan_request_model import (
    LeavePlanRequest,
    LeavePlanRequestCreate,
    LeavePlanRequestPublic,
    LeavePlanRequestsPublic,
    LeavePlanRequestUpdate,
    LeavePlanDetail,
)
from app.leave_services import approval_service
from app.models import Message

router = APIRouter(prefix="/leave-plan-requests", tags=["leave-plan-requests"])


@router.get("/", response_model=LeavePlanRequestsPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    owner_id: uuid.UUID | None = None,
    approver_id: uuid.UUID | None = None,
) -> Any:
    """
    Retrieve Items. Optional status/owner_id/approver_id narrow the result
    further - non-superusers passing an owner_id/approver_id other than
    their own id have it ignored (not an error), since the base visibility
    scope below already limits them to their own + approver rows.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(LeavePlanRequest)
        statement = select(LeavePlanRequest)
    else:
        visibility = or_(
            LeavePlanRequest.owner_id == current_user.id,
            LeavePlanRequest.approver_id == current_user.id,
        )
        count_statement = (
            select(func.count()).select_from(LeavePlanRequest).where(visibility)
        )
        statement = select(LeavePlanRequest).where(visibility)

    if status is not None:
        count_statement = count_statement.where(LeavePlanRequest.status == status)
        statement = statement.where(LeavePlanRequest.status == status)

    if owner_id is not None and (
        current_user.is_superuser or owner_id == current_user.id
    ):
        count_statement = count_statement.where(
            LeavePlanRequest.owner_id == owner_id
        )
        statement = statement.where(LeavePlanRequest.owner_id == owner_id)

    if approver_id is not None and (
        current_user.is_superuser or approver_id == current_user.id
    ):
        count_statement = count_statement.where(
            LeavePlanRequest.approver_id == approver_id
        )
        statement = statement.where(LeavePlanRequest.approver_id == approver_id)

    count = session.exec(count_statement).one()
    rows = session.exec(statement.offset(skip).limit(limit)).all()

    return LeavePlanRequestsPublic(data=rows, count=count)


@router.get("/{id}", response_model=LeavePlanRequestPublic)
def retrieve(session: SessionDep, id: uuid.UUID) -> Any:  # type: ignore
    """
    Get item by ID.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    return row


@router.post("/", response_model=LeavePlanRequestPublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: LeavePlanRequestCreate,
) -> Any:
    """
    Create new item.
    """

    requested_at = datetime.now()
    status = "draft"
    details = row_in.details

    dates = [d.leave_date for d in details]
    if len(dates) != len(set(dates)):
        raise HTTPException(
            status_code=422, detail="Duplicate leave dates are not allowed in details"
        )

    row_data = row_in.model_dump(exclude={"details"})
    row = LeavePlanRequest.model_validate(
        row_data,
        update={
            "owner_id": current_user.id,
            "team_id": current_user.team_id,
            "requested_at": requested_at,
            "status": status,
            "amount": len(dates),
        },
    )

    # Convert each detail
    row.details = [
        LeavePlanDetail(**detail.model_dump(), leave_plan_id=row.id)
        for detail in details
    ]

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}", response_model=LeavePlanRequestPublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: LeavePlanRequestUpdate,
) -> Any:
    """
    Update an item.
    """

    details = row_in.details

    dates = [d.leave_date for d in details]
    if len(dates) != len(set(dates)):
        raise HTTPException(
            status_code=422, detail="Duplicate leave dates are not allowed in details"
        )

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if row.status != "draft" or current_user.id != row.owner_id:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to update item"
        )

    row_data = row_in.model_dump(exclude_unset=True, exclude={"details"})
    row.sqlmodel_update(row_data, update={"amount": len(dates)})

    # Reinsert details
    # Remove old details
    for detail in row.details:
        session.delete(detail)
    # Add new details
    row.details = [
        LeavePlanDetail(**detail.model_dump(), leave_plan_id=row.id)
        for detail in details
    ]

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.delete("/{id}")
def delete(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,  # type: ignore
) -> Message:
    """
    Delete an item.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if row.status != "draft" or current_user.id != row.owner_id:
        raise HTTPException(
            status_code=403, detail="Not enough permission to delete this item"
        )

    # Remove old details
    for detail in row.details:
        session.delete(detail)

    session.delete(row)
    session.commit()
    return Message(message="Deleted successfully")


@router.put("/{id}/submit", response_model=LeavePlanRequestPublic)
def submit(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Submit an item.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not approval_service.can_submit(current_user, row):
        raise HTTPException(status_code=403, detail="Not enough permissions.")

    approver = approval_service.get_line_approver(current_user)
    if not approver:
        raise HTTPException(status_code=422, detail="No approver found.")

    row.status = "pending"
    row.approver_id = approver.id
    row.submitted_at = datetime.now()

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}/approve", response_model=LeavePlanRequestPublic)
def approve(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Approve an item.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not approval_service.can_approve(current_user, row):
        raise HTTPException(status_code=403, detail="Not enough permissions.")

    row.status = "approved"
    row.approval_at = datetime.now()

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}/reject", response_model=LeavePlanRequestPublic)
def reject(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Reject an item.
    """

    row = session.get(LeavePlanRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not approval_service.can_reject(current_user, row):
        raise HTTPException(status_code=403, detail="Not enough permissions.")

    row.status = "rejected"
    row.approval_at = datetime.now()

    session.add(row)
    session.commit()
    session.refresh(row)
    return row
