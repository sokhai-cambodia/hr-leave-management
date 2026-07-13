from typing import Any

from sqlmodel import Session

from app.leave_models.notification_model import Notification
from app.models import User


class NotificationService:
    def __init__(self, session: Session):
        self.session = session

    def notify_submitted(
        self, *, row: Any, entity_type: str, actor: User
    ) -> Notification:
        notification = Notification(
            recipient_id=row.approver_id,
            actor_id=actor.id,
            event_type=f"{entity_type}.submitted",
            entity_type=entity_type,
            entity_id=row.id,
            message=f"{actor.full_name or actor.email} submitted a {row.leave_type.name} request",
        )
        self.session.add(notification)
        return notification

    def notify_approved(
        self, *, row: Any, entity_type: str, actor: User
    ) -> Notification:
        notification = Notification(
            recipient_id=row.owner_id,
            actor_id=actor.id,
            event_type=f"{entity_type}.approved",
            entity_type=entity_type,
            entity_id=row.id,
            message=f"Your {row.leave_type.name} request was approved",
        )
        self.session.add(notification)
        return notification

    def notify_rejected(
        self, *, row: Any, entity_type: str, actor: User
    ) -> Notification:
        notification = Notification(
            recipient_id=row.owner_id,
            actor_id=actor.id,
            event_type=f"{entity_type}.rejected",
            entity_type=entity_type,
            entity_id=row.id,
            message=f"Your {row.leave_type.name} request was rejected",
        )
        self.session.add(notification)
        return notification
