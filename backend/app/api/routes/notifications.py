import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.leave_models.notification_model import (
    Notification,
    NotificationsPublic,
)
from app.models import Message

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=NotificationsPublic)
def list(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    is_read: bool | None = None,
) -> Any:
    """
    List the current user's notifications, newest first.
    """

    count_statement = (
        select(func.count())
        .select_from(Notification)
        .where(Notification.recipient_id == current_user.id)
    )
    statement = select(Notification).where(Notification.recipient_id == current_user.id)

    if is_read is not None:
        count_statement = count_statement.where(Notification.is_read == is_read)
        statement = statement.where(Notification.is_read == is_read)

    count = session.exec(count_statement).one()
    rows = session.exec(
        statement.order_by(Notification.created_at.desc())  # type: ignore
        .offset(skip)
        .limit(limit)
    ).all()

    unread_count_statement = (
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    unread_count = session.exec(unread_count_statement).one()

    return NotificationsPublic(data=rows, count=count, unread_count=unread_count)


@router.get("/unread-count")
def unread_count(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Cheap unread count for badge polling.
    """

    statement = (
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    count = session.exec(statement).one()
    return {"count": count}


@router.put("/{id}/read", response_model=Message)
def mark_read(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Mark a single notification as read.
    """

    row = session.get(Notification, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    if row.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions.")

    row.is_read = True
    session.add(row)
    session.commit()
    return Message(message="Marked as read")


@router.put("/mark-all-read", response_model=Message)
def mark_all_read(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Mark all of the current user's unread notifications as read.
    """

    statement = select(Notification).where(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False,  # noqa: E712
    )
    rows = session.exec(statement).all()
    for row in rows:
        row.is_read = True
        session.add(row)
    session.commit()
    return Message(message=f"Marked {len(rows)} notification(s) as read")
