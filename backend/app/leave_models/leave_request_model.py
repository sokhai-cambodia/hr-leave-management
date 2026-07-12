import uuid
from datetime import date, datetime

from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable, LeaveTypePresentable


# Shared properties
class LeaveRequestBase(SQLModel):
    start_date: date
    end_date: date
    description: str | None = None


# Create
class LeaveRequestCreate(LeaveRequestBase):
    leave_type_id: uuid.UUID


# Update
class LeaveRequestUpdate(LeaveRequestBase):
    leave_type_id: uuid.UUID


# Database table
class LeaveRequest(LeaveRequestBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    team_id: uuid.UUID = Field(
        foreign_key="team.id", nullable=False, ondelete="CASCADE"
    )
    year: str | None = Field(
        max_length=4, default_factory=lambda: str(date.today().year)
    )
    leave_type_id: uuid.UUID = Field(
        foreign_key="leavetype.id", nullable=False, ondelete="CASCADE"
    )
    amount: float
    status: str = Field(
        max_length=50, include=["draft", "pending", "approved", "rejected"]
    )
    requested_at: datetime = Field(default_factory=datetime.now)
    submitted_at: datetime | None = None
    approver_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )
    approval_at: datetime | None = None

    # Relationships
    owner: "User" = Relationship(
        back_populates="leave_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.owner_id]"},
    )
    approver: "User" = Relationship(
        back_populates="approved_leave_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.approver_id]"},
    )
    team: "Team" = Relationship(back_populates="leave_requests")
    leave_type: "LeaveType" = Relationship(back_populates="leave_requests")


# Public (for API responses)
class LeaveRequestPublic(LeaveRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    leave_type_id: uuid.UUID
    amount: float
    status: str
    requested_at: datetime
    submitted_at: datetime | None
    approver_id: uuid.UUID | None
    approval_at: datetime | None

    owner: UserPresentable
    leave_type: LeaveTypePresentable
    approver: UserPresentable | None


# Public list wrapper
class LeaveRequestsPublic(SQLModel):
    data: list[LeaveRequestPublic]
    count: int
