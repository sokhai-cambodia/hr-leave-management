import uuid
from typing import Sequence

from fastapi import HTTPException
from sqlmodel import Session, select

from app.leave_models.team_model import Team, TeamPublic
from app.models import User


def get_team_with_members(session: Session, team_id: uuid.UUID) -> TeamPublic:
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return TeamPublic(**team.model_dump())


def get_members(*, session: Session, team_id: uuid.UUID) -> Sequence[User]:
    statement = select(User).where(User.team_id == team_id)
    members = session.exec(statement).all()
    return members
