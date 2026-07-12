from app.api.deps import CurrentUser
from app.models import User


def can_submit(current_user: CurrentUser, db_obj) -> bool:
    approver = get_line_approver(current_user)
    if approver and current_user.id == db_obj.owner_id and db_obj.status == "draft":
        return True
    return False


def can_approve(current_user: CurrentUser, db_obj) -> bool:
    if current_user.id == db_obj.approver_id and db_obj.status == "pending":
        return True
    return False


def can_reject(current_user: CurrentUser, db_obj) -> bool:
    return can_approve(current_user, db_obj)


def get_line_approver(current_user: CurrentUser) -> User | None:
    team = current_user.team if current_user else None
    if team:
        return team.team_owner
    return None
