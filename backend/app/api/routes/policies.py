import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.leave_policy_model import (
    PoliciesPublic,
    Policy,
    PolicyCreate,
    PolicyPublic,
    PolicyUpdate,
)
from app.models import Message

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("/", response_model=PoliciesPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve Items.
    """

    count_statement = select(func.count()).select_from(Policy)
    count = session.exec(count_statement).one()
    statement = select(Policy).offset(skip).limit(limit)
    rows = session.exec(statement).all()

    return PoliciesPublic(data=rows, count=count)


@router.get("/{id}", response_model=PolicyPublic)
def retrieve(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:  # type: ignore
    """
    Get item by ID.
    """

    row = session.get(Policy, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    return row


@router.post("/", response_model=PolicyPublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: PolicyCreate,
) -> Any:
    """
    Create new item.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = Policy.model_validate(row_in, update={"owner_id": current_user.id})
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}", response_model=PolicyPublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: PolicyUpdate,
) -> Any:
    """
    Update an item.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = session.get(Policy, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    update_dict = row_in.model_dump(exclude_unset=True)
    row.sqlmodel_update(update_dict)
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
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = session.get(Policy, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    session.delete(row)
    session.commit()
    return Message(message="Deleted successfully")
