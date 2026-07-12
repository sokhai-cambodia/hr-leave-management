import uuid

from sqlmodel import Field, Relationship, SQLModel

from app.leave_models.presentable_model import UserPresentable


# Team
# Shared properties
class TeamBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    team_owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    is_active: bool = True


# Properties to receive on item creation
class TeamCreate(TeamBase):
    pass


# Properties to receive on item update
class TeamUpdate(TeamBase):
    pass


# Database model, database table inferred from class name
class Team(TeamBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )

    # Relationships
    team_owner: "User" = Relationship(
        back_populates="team_owners",
        sa_relationship_kwargs={"foreign_keys": "Team.team_owner_id"},
    )
    owner: "User" = Relationship(
        back_populates="teams",
        sa_relationship_kwargs={"foreign_keys": "[Team.owner_id]"},
    )
    leave_requests: list["LeaveRequest"] = Relationship(back_populates="team")
    leave_plan_requests: list["LeavePlanRequest"] = Relationship(back_populates="team")
    team_members: list["User"] = Relationship(
        back_populates="team",
        sa_relationship_kwargs={"foreign_keys": "[User.team_id]"},
    )


# Properties to return via API, id is always required
class TeamPublic(TeamBase):
    id: uuid.UUID
    team_owner_id: uuid.UUID

    team_members: list[UserPresentable] = []
    team_owner: UserPresentable | None


class TeamsPublic(SQLModel):
    data: list[TeamPublic]
    count: int
