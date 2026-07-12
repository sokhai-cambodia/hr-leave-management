import uuid

from sqlalchemy import Column, Float
from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable, LeaveTypePresentable


# Leave Balance
# Shared properties
class LeaveBalanceBase(SQLModel):
    year: str = Field(max_length=4)
    balance: float = Field(
        default=18, sa_column=Column(Float, nullable=False, server_default="18")
    )
    leave_type_id: uuid.UUID = Field(
        foreign_key="leavetype.id", nullable=False, ondelete="CASCADE"
    )


# Properties to receive on item creation
class LeaveBalanceCreate(LeaveBalanceBase):
    owner_id: uuid.UUID


# Properties to receive on item update
class LeaveBalanceUpdate(LeaveBalanceBase):
    owner_id: uuid.UUID


# Database model, database table inferred from class name
class LeaveBalance(LeaveBalanceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    taken_balance: float = Field(
        default=0, sa_column=Column(Float, nullable=False, server_default="0")
    )

    owner: "User" = Relationship(back_populates="leave_balances")
    leave_type: "LeaveType" = Relationship(back_populates="leave_balances")

    @property
    def available_balance(self) -> float:
        return self.balance - self.taken_balance


# Properties to return via API, id is always required
class LeaveBalancePublic(LeaveBalanceBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    taken_balance: float
    available_balance: float

    owner: UserPresentable
    leave_type: LeaveTypePresentable


class LeaveBalancesPublic(SQLModel):
    data: list[LeaveBalancePublic]
    count: int
