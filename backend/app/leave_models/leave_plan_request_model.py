import uuid
from datetime import datetime, date

from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable, LeaveTypePresentable


# Leave Plan Request Details
# Shared properties
class LeavePlanDetailBase(SQLModel):
    leave_date: date = Field(default_factory=datetime.now)


# Create
class LeavePlanDetailCreate(LeavePlanDetailBase):
    pass


# Update
class LeavePlanDetailUpdate(LeavePlanDetailBase):
    pass


# Database table
class LeavePlanDetail(LeavePlanDetailBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    leave_plan_id: uuid.UUID = Field(
        foreign_key="leaveplanrequest.id", nullable=False, ondelete="CASCADE"
    )

    leave_plan_request: "LeavePlanRequest" = Relationship(back_populates="details")


# Public (for API responses)
class LeavePlanDetailPublic(LeavePlanDetailBase):
    id: uuid.UUID


# Public list wrapper
class LeavePlanDetailsPublic(SQLModel):
    data: list[LeavePlanDetailPublic]
    count: int


# Leave Plan Request
# Shared properties
class LeavePlanRequestBase(SQLModel):
    description: str | None = None


# Create
class LeavePlanRequestCreate(LeavePlanRequestBase):
    leave_type_id: uuid.UUID
    details: list[LeavePlanDetailCreate]


# Update
class LeavePlanRequestUpdate(LeavePlanRequestBase):
    leave_type_id: uuid.UUID
    details: list[LeavePlanDetailCreate]


# Table
class LeavePlanRequest(LeavePlanRequestBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    team_id: uuid.UUID = Field(
        foreign_key="team.id", nullable=False, ondelete="CASCADE"
    )
    year: str | None = Field(max_length=4, default_factory=lambda: str(date.today().year))
    leave_type_id: uuid.UUID = Field(
        foreign_key="leavetype.id", nullable=False, ondelete="CASCADE"
    )
    amount: float
    status: str = Field(max_length=50)
    requested_at: datetime = Field(default_factory=datetime.now)
    submitted_at: datetime | None = None
    approver_id: uuid.UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )
    approval_at: datetime | None = None

    # Relationships
    owner: "User" = Relationship(
        back_populates="leave_plan_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.owner_id]"},
    )
    approver: "User" = Relationship(
        back_populates="approved_leave_plan_requests",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.approver_id]"},
    )
    team: "Team" = Relationship(back_populates="leave_plan_requests")
    leave_type: "LeaveType" = Relationship(back_populates="leave_plan_requests")
    details: list["LeavePlanDetail"] = Relationship(back_populates="leave_plan_request")


# Public (for API responses)
class LeavePlanRequestPublic(LeavePlanRequestBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    leave_type_id: uuid.UUID
    requested_at: datetime
    submitted_at: datetime | None
    approver_id: uuid.UUID | None
    approval_at: datetime | None
    status: str
    amount: float
    details: list[LeavePlanDetailPublic] = []

    owner: UserPresentable
    leave_type: LeaveTypePresentable
    approver: UserPresentable | None


# Public list wrapper
class LeavePlanRequestsPublic(SQLModel):
    data: list[LeavePlanRequestPublic]
    count: int
