import uuid
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable


# Audit Log
# Database table
class AuditLog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    actor_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )
    action: str = Field(max_length=20)  # create, update, delete, submit, approve, reject
    entity_type: str = Field(max_length=30, index=True)
    entity_id: uuid.UUID
    summary: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, index=True)

    # Relationships
    actor: "User" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[AuditLog.actor_id]"},
    )


# Public (for API responses)
class AuditLogPublic(SQLModel):
    id: uuid.UUID
    action: str
    entity_type: str
    entity_id: uuid.UUID
    summary: str
    created_at: datetime

    actor: UserPresentable | None


# Public list wrapper
class AuditLogsPublic(SQLModel):
    data: list[AuditLogPublic]
    count: int
