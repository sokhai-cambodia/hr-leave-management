import uuid
from typing import Any

from fastapi import APIRouter, Depends
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.leave_models.audit_log_model import AuditLog, AuditLogsPublic

router = APIRouter(
    prefix="/audit-logs",
    tags=["audit-logs"],
    dependencies=[Depends(get_current_active_superuser)],
)


@router.get("/", response_model=AuditLogsPublic)
def list(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    entity_type: str | None = None,
    action: str | None = None,
    actor_id: uuid.UUID | None = None,
) -> Any:
    """
    Retrieve audit log entries, newest first. Superuser-only - this is a
    read-only trail, there is no create/update/delete endpoint; entries are
    written internally by AuditService as a side effect of the mutations
    they describe.
    """

    count_statement = select(func.count()).select_from(AuditLog)
    statement = select(AuditLog).order_by(AuditLog.created_at.desc())

    if entity_type is not None:
        count_statement = count_statement.where(AuditLog.entity_type == entity_type)
        statement = statement.where(AuditLog.entity_type == entity_type)

    if action is not None:
        count_statement = count_statement.where(AuditLog.action == action)
        statement = statement.where(AuditLog.action == action)

    if actor_id is not None:
        count_statement = count_statement.where(AuditLog.actor_id == actor_id)
        statement = statement.where(AuditLog.actor_id == actor_id)

    count = session.exec(count_statement).one()
    rows = session.exec(statement.offset(skip).limit(limit)).all()

    return AuditLogsPublic(data=rows, count=count)
