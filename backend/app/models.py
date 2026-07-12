from datetime import date
import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# Register Models
from app.leave_models.leave_balance_model import LeaveBalance
from app.leave_models.leave_plan_request_model import LeavePlanRequest
from app.leave_models.leave_policy_model import Policy
from app.leave_models.leave_request_model import LeaveRequest
from app.leave_models.leave_type_model import LeaveType
from app.leave_models.presentable_model import TeamPresentable
from app.leave_models.public_holiday_model import PublicHoliday
from app.leave_models.team_model import Team


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    team_id: uuid.UUID | None = Field(
        foreign_key="team.id", default=None, nullable=True, ondelete="SET NULL"
    )


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)

    # Relationships Leave Models
    policies: list["Policy"] = Relationship(back_populates="owner", cascade_delete=True)
    public_holidays: list["PublicHoliday"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    leave_types: list["LeaveType"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    leave_balances: list["LeaveBalance"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    team: "Team" = Relationship(
        back_populates="team_members",
        sa_relationship_kwargs={"foreign_keys": "[User.team_id]"},
    )
    teams: list["Team"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"foreign_keys": "[Team.owner_id]"},
        cascade_delete=True,
    )
    team_owners: list["Team"] = Relationship(
        back_populates="team_owner",
        sa_relationship_kwargs={"foreign_keys": "[Team.team_owner_id]"},
        cascade_delete=True,
    )
    leave_requests: list["LeaveRequest"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.owner_id]"},
        cascade_delete=True,
    )
    approved_leave_requests: list["LeaveRequest"] = Relationship(
        back_populates="approver",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.approver_id]"},
        cascade_delete=True,
    )
    leave_plan_requests: list["LeavePlanRequest"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.owner_id]"},
        cascade_delete=True,
    )
    approved_leave_plan_requests: list["LeavePlanRequest"] = Relationship(
        back_populates="approver",
        sa_relationship_kwargs={"foreign_keys": "[LeavePlanRequest.approver_id]"},
        cascade_delete=True,
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    team: TeamPresentable | None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class LeaveRecommendation(SQLModel):
    leave_date: date
    bridge_holiday: bool
    team_workload: int
    preference_score: int
    predicted_score: float

class LeaveRecommendations(SQLModel):
    leave_type_id: uuid.UUID
    year: int
    data: list[LeaveRecommendation]
