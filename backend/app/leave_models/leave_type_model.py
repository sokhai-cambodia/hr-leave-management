import uuid

from sqlmodel import Field, Relationship, SQLModel


# Leave Type
# Shared properties
class LeaveTypeBase(SQLModel):
    code: str = Field(index=True, max_length=255)
    name: str = Field(default="Untitled", max_length=255)
    entitlement: int = Field(default=0)
    description: str | None = Field(default=None, max_length=255)
    is_allow_plan: bool = True
    is_active: bool = True


# Properties to receive on item creation
class LeaveTypeCreate(LeaveTypeBase):
    pass


# Properties to receive on item update
class LeaveTypeUpdate(LeaveTypeBase):
    pass


# Database model, database table inferred from class name
class LeaveType(LeaveTypeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )

    owner: "User" = Relationship(back_populates="leave_types")
    leave_requests: list["LeaveRequest"] = Relationship(back_populates="leave_type")
    leave_plan_requests: list["LeavePlanRequest"] = Relationship(
        back_populates="leave_type"
    )
    leave_balances: list["LeaveBalance"] = Relationship(
        back_populates="leave_type"
    )


# Properties to return via API, id is always required
class LeaveTypePublic(LeaveTypeBase):
    id: uuid.UUID


class LeaveTypesPublic(SQLModel):
    data: list[LeaveTypePublic]
    count: int
