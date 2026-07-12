import uuid

from sqlmodel import Field, Relationship, SQLModel

# Policy
# Shared properties
class PolicyBase(SQLModel):
    code: str = Field(index=True, max_length=255) # support code (weekday, team_workload, bridge_holiday)
    name: str = Field(default="Untitled", max_length=255)
    operation: str | None = Field(default="==", max_length=10)  # comparison operator (in, >, <, >=, <=, "==")
    value: str = Field(max_length=255)
    score: float | None= Field(default=0) # score to apply if rule matches
    description: str | None = Field(default=None, max_length=255)
    is_active: bool = True


# Properties to receive on item creation
class PolicyCreate(PolicyBase):
    pass


# Properties to receive on item update
class PolicyUpdate(PolicyBase):
    pass


# Database model, database table inferred from class name
class Policy(PolicyBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: "User" = Relationship(back_populates="policies")


# Properties to return via API, id is always required
class PolicyPublic(PolicyBase):
    id: uuid.UUID


class PoliciesPublic(SQLModel):
    data: list[PolicyPublic]
    count: int
