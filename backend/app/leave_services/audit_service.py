import uuid

from sqlmodel import Session

from app.leave_models.audit_log_model import AuditLog
from app.models import User


class AuditService:
    def __init__(self, session: Session):
        self.session = session

    def record(
        self,
        *,
        actor: User,
        action: str,
        entity_type: str,
        entity_id: uuid.UUID,
        summary: str,
    ) -> AuditLog:
        log = AuditLog(
            actor_id=actor.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            summary=summary,
        )
        self.session.add(log)
        return log
