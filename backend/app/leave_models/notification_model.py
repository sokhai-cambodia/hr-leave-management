import uuid
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable


# Database table
class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    recipient_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    actor_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )
    event_type: str = Field(max_length=50)
    entity_type: str = Field(max_length=30)
    entity_id: uuid.UUID
    message: str = Field(max_length=255)
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    recipient: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Notification.recipient_id]"},
    )
    actor: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Notification.actor_id]"},
    )


# Public (for API responses)
class NotificationPublic(SQLModel):
    id: uuid.UUID
    event_type: str
    entity_type: str
    entity_id: uuid.UUID
    message: str
    is_read: bool
    created_at: datetime

    actor: UserPresentable | None


# Public list wrapper
class NotificationsPublic(SQLModel):
    data: list[NotificationPublic]
    count: int
    unread_count: int
