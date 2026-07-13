import uuid
from datetime import datetime
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_request_model import (
    LeaveRequest,
    LeaveRequestCreate,
    LeaveRequestPublic,
    LeaveRequestsPublic,
    LeaveRequestUpdate,
)
from app.leave_services import approval_service
from app.leave_services.balance_service import BalanceService
from app.leave_services.leave_service import LeaveService
from app.models import Message
from fastapi import APIRouter, HTTPException
from sqlmodel import func, or_, select

router = APIRouter(prefix="/leave-requests", tags=["leave-requests"])


@router.get("/", response_model=LeaveRequestsPublic)
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
        count_statement = select(func.count()).select_from(LeaveRequest)
        statement = select(LeaveRequest)
    else:
        visibility = or_(
            LeaveRequest.owner_id == current_user.id,
            LeaveRequest.approver_id == current_user.id,
        )
        count_statement = (
            select(func.count()).select_from(LeaveRequest).where(visibility)
        )
        statement = select(LeaveRequest).where(visibility)

    if status is not None:
        count_statement = count_statement.where(LeaveRequest.status == status)
        statement = statement.where(LeaveRequest.status == status)

    if owner_id is not None and (
        current_user.is_superuser or owner_id == current_user.id
    ):
        count_statement = count_statement.where(LeaveRequest.owner_id == owner_id)
        statement = statement.where(LeaveRequest.owner_id == owner_id)

    if approver_id is not None and (
        current_user.is_superuser or approver_id == current_user.id
    ):
        count_statement = count_statement.where(
            LeaveRequest.approver_id == approver_id
        )
        statement = statement.where(LeaveRequest.approver_id == approver_id)

    count = session.exec(count_statement).one()
    rows = session.exec(statement.offset(skip).limit(limit)).all()

    return LeaveRequestsPublic(data=rows, count=count)


@router.get("/{id}", response_model=LeaveRequestPublic)
def retrieve(session: SessionDep, id: uuid.UUID) -> Any:  # type: ignore
    """
    Get item by ID.
    """

    row = session.get(LeaveRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    return row


@router.post("/", response_model=LeaveRequestPublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: LeaveRequestCreate,
) -> Any:
    """
    Create new item.
    """

    service = LeaveService(session=session, owner_id=current_user.id)
    amount = service.calculate_leave_days(row_in)

    if not amount:
        raise HTTPException(status_code=400, detail="Invalid start and end dates.")

    if not service.has_available_balance(
        leave_type_id=row_in.leave_type_id, requested_days=amount
    ):
        raise HTTPException(status_code=400, detail="Insufficient leave balance.")

    requested_at = datetime.now()
    status = "draft"

    row_data = row_in.model_dump()
    row = LeaveRequest.model_validate(
        row_data,
        update={
            "owner_id": current_user.id,
            "team_id": current_user.team_id,
            "requested_at": requested_at,
            "status": status,
            "amount": amount,
        },
    )

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}", response_model=LeaveRequestPublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: LeaveRequestUpdate,
) -> Any:
    """
    Update an item.
    """

    service = LeaveService(session=session, owner_id=current_user.id)
    amount = service.calculate_leave_days(row_in)

    if not amount:
        raise HTTPException(status_code=400, detail="Invalid start and end dates.")

    if not service.has_available_balance(
        leave_type_id=row_in.leave_type_id, requested_days=amount
    ):
        raise HTTPException(status_code=400, detail="Insufficient leave balance.")

    row = session.get(LeaveRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if row.status != "draft" or current_user.id != row.owner_id:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to update item"
        )

    row_data = row_in.model_dump(exclude_unset=True)
    row.sqlmodel_update(row_data, update={"amount": amount})

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

    row = session.get(LeaveRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if row.status != "draft" or current_user.id != row.owner_id:
        raise HTTPException(
            status_code=403, detail="Not enough permission to delete this item"
        )

    session.delete(row)
    session.commit()
    return Message(message="Deleted successfully")


@router.put("/{id}/submit", response_model=LeaveRequestPublic)
def submit(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Submit an item.
    """

    row = session.get(LeaveRequest, id)
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

    service = LeaveService(session=session, owner_id=current_user.id)
    if not service.has_available_balance(
        leave_type_id=row.leave_type_id, requested_days=row.amount, year=row.year
    ):
        raise HTTPException(status_code=400, detail="Insufficient leave balance.")

    # Debit the leave balance
    service_balance = BalanceService(session=session, owner_id=current_user.id)
    service_balance.debit_balance(
        owner_id=row.owner_id, amount=row.amount, leave_type_id=row.leave_type_id
    )

    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}/approve", response_model=LeaveRequestPublic)
def approve(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Approve an item.
    """

    row = session.get(LeaveRequest, id)
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


@router.put("/{id}/reject", response_model=LeaveRequestPublic)
def reject(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Reject an item.
    """

    row = session.get(LeaveRequest, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if not approval_service.can_reject(current_user, row):
        raise HTTPException(status_code=403, detail="Not enough permissions.")

    row.status = "rejected"
    row.approval_at = datetime.now()

    # Credit the leave balance
    service_balance = BalanceService(session=session, owner_id=current_user.id)
    service_balance.credit_balance(
        owner_id=row.owner_id, amount=row.amount, leave_type_id=row.leave_type_id
    )

    session.add(row)
    session.commit()
    session.refresh(row)
    return row
