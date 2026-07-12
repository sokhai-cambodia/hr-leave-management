import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.public_holiday_model import (
    PublicHoliday,
    PublicHolidayCreate,
    PublicHolidayPublic,
    PublicHolidaysPublic,
    PublicHolidayUpdate,
)
from app.models import Message

router = APIRouter(prefix="/public-holidays", tags=["public-holidays"])


@router.get("/", response_model=PublicHolidaysPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve Items.
    """

    count_statement = select(func.count()).select_from(PublicHoliday)
    count = session.exec(count_statement).one()
    statement = select(PublicHoliday).offset(skip).limit(limit)
    rows = session.exec(statement).all()

    return PublicHolidaysPublic(data=rows, count=count)


@router.get("/{id}", response_model=PublicHolidayPublic)
def retrieve(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:  # type: ignore
    """
    Get item by ID.
    """

    row = session.get(PublicHoliday, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    return row


@router.post("/", response_model=PublicHolidayPublic)
def create(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    row_in: PublicHolidayCreate,
) -> Any:
    """
    Create new item.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = PublicHoliday.model_validate(row_in, update={"owner_id": current_user.id})
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.put("/{id}", response_model=PublicHolidayPublic)
def update(
    *,
    session: SessionDep,  # type: ignore
    current_user: CurrentUser,
    id: uuid.UUID,
    row_in: PublicHolidayUpdate,
) -> Any:
    """
    Update an item.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No permissions")

    row = session.get(PublicHoliday, id)
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

    row = session.get(PublicHoliday, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    session.delete(row)
    session.commit()
    return Message(message="Deleted successfully")
