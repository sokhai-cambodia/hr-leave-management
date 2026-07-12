import uuid

from sqlmodel import Field, Relationship, SQLModel


# Public Holiday
# Shared properties
class PublicHolidayBase(SQLModel):
    date: str = Field(index=True)
    name: str = Field(default="Untitled", max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class PublicHolidayCreate(PublicHolidayBase):
    pass


# Properties to receive on item update
class PublicHolidayUpdate(PublicHolidayBase):
    pass


# Database model, database table inferred from class name
class PublicHoliday(PublicHolidayBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: "User" = Relationship(back_populates="public_holidays")


# Properties to return via API, id is always required
class PublicHolidayPublic(PublicHolidayBase):
    id: uuid.UUID


class PublicHolidaysPublic(SQLModel):
    data: list[PublicHolidayPublic]
    count: int
