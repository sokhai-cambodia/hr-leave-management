import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.core.config import settings
from app.leave_models.leave_balance_model import LeaveBalance
from app.leave_models.leave_type_model import LeaveType
from app.leave_models.team_model import Team
from app.models import User, UserCreate
from tests.utils.user import user_authentication_headers
from tests.utils.utils import random_email, random_lower_string


def _create_user_with_password(db: Session) -> tuple[User, str]:
    password = random_lower_string()
    user = crud.create_user(
        session=db, user_create=UserCreate(email=random_email(), password=password)
    )
    return user, password


def _setup_owner_and_approver(
    client: TestClient, db: Session
) -> tuple[User, dict[str, str], User, dict[str, str], LeaveType]:
    """
    Creates an approver (team owner) and an owner (team member reporting to
    that approver), plus a leave type + funded balance for the owner, so a
    leave request can be created/submitted/approved/rejected end to end.
    """

    approver, approver_password = _create_user_with_password(db)
    owner, owner_password = _create_user_with_password(db)

    team = Team(
        name=random_lower_string(),
        team_owner_id=approver.id,
        owner_id=approver.id,
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    owner.team_id = team.id
    db.add(owner)
    db.commit()
    db.refresh(owner)

    leave_type = LeaveType(
        code=random_lower_string()[:10],
        name="Annual Leave",
        entitlement=18,
        owner_id=approver.id,
    )
    db.add(leave_type)
    db.commit()
    db.refresh(leave_type)

    balance = LeaveBalance(
        year="2026",
        balance=18,
        leave_type_id=leave_type.id,
        owner_id=owner.id,
    )
    db.add(balance)
    db.commit()

    approver_headers = user_authentication_headers(
        client=client, email=approver.email, password=approver_password
    )
    owner_headers = user_authentication_headers(
        client=client, email=owner.email, password=owner_password
    )

    return owner, owner_headers, approver, approver_headers, leave_type


def _create_and_submit_leave_request(
    client: TestClient,
    owner_headers: dict[str, str],
    leave_type: LeaveType,
) -> dict:
    create_resp = client.post(
        f"{settings.API_V1_STR}/leave-requests/",
        headers=owner_headers,
        json={
            "start_date": "2026-08-03",
            "end_date": "2026-08-04",
            "leave_type_id": str(leave_type.id),
        },
    )
    assert create_resp.status_code == 200, create_resp.text
    row = create_resp.json()

    submit_resp = client.put(
        f"{settings.API_V1_STR}/leave-requests/{row['id']}/submit",
        headers=owner_headers,
    )
    assert submit_resp.status_code == 200, submit_resp.text
    return submit_resp.json()


def test_submit_notifies_approver(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    _create_and_submit_leave_request(client, owner_headers, leave_type)

    resp = client.get(f"{settings.API_V1_STR}/notifications/", headers=approver_headers)
    assert resp.status_code == 200
    content = resp.json()
    assert content["unread_count"] >= 1
    notification = content["data"][0]
    assert notification["event_type"] == "leave_request.submitted"
    assert notification["entity_type"] == "leave_request"
    assert owner.full_name is None or owner.full_name in notification["message"]
    assert notification["is_read"] is False


def test_approve_notifies_owner(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    row = _create_and_submit_leave_request(client, owner_headers, leave_type)

    approve_resp = client.put(
        f"{settings.API_V1_STR}/leave-requests/{row['id']}/approve",
        headers=approver_headers,
    )
    assert approve_resp.status_code == 200, approve_resp.text

    resp = client.get(f"{settings.API_V1_STR}/notifications/", headers=owner_headers)
    assert resp.status_code == 200
    content = resp.json()
    matches = [
        n for n in content["data"] if n["event_type"] == "leave_request.approved"
    ]
    assert len(matches) == 1
    assert matches[0]["message"] == f"Your {leave_type.name} request was approved"


def test_reject_notifies_owner(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    row = _create_and_submit_leave_request(client, owner_headers, leave_type)

    reject_resp = client.put(
        f"{settings.API_V1_STR}/leave-requests/{row['id']}/reject",
        headers=approver_headers,
    )
    assert reject_resp.status_code == 200, reject_resp.text

    resp = client.get(f"{settings.API_V1_STR}/notifications/", headers=owner_headers)
    assert resp.status_code == 200
    content = resp.json()
    matches = [
        n for n in content["data"] if n["event_type"] == "leave_request.rejected"
    ]
    assert len(matches) == 1
    assert matches[0]["message"] == f"Your {leave_type.name} request was rejected"


def test_unread_count_endpoint(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    before = client.get(
        f"{settings.API_V1_STR}/notifications/unread-count", headers=approver_headers
    ).json()["count"]

    _create_and_submit_leave_request(client, owner_headers, leave_type)

    after = client.get(
        f"{settings.API_V1_STR}/notifications/unread-count", headers=approver_headers
    ).json()["count"]
    assert after == before + 1


def test_mark_read_rejects_non_recipient(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    _create_and_submit_leave_request(client, owner_headers, leave_type)

    notifications = client.get(
        f"{settings.API_V1_STR}/notifications/", headers=approver_headers
    ).json()["data"]
    notification_id = notifications[0]["id"]

    resp = client.put(
        f"{settings.API_V1_STR}/notifications/{notification_id}/read",
        headers=owner_headers,
    )
    assert resp.status_code == 403


def test_mark_read_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    resp = client.put(
        f"{settings.API_V1_STR}/notifications/{uuid.uuid4()}/read",
        headers=superuser_token_headers,
    )
    assert resp.status_code == 404


def test_mark_all_read(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    _create_and_submit_leave_request(client, owner_headers, leave_type)

    unread_before = client.get(
        f"{settings.API_V1_STR}/notifications/unread-count", headers=approver_headers
    ).json()["count"]
    assert unread_before >= 1

    mark_resp = client.put(
        f"{settings.API_V1_STR}/notifications/mark-all-read", headers=approver_headers
    )
    assert mark_resp.status_code == 200

    unread_after = client.get(
        f"{settings.API_V1_STR}/notifications/unread-count", headers=approver_headers
    ).json()["count"]
    assert unread_after == 0


def test_is_read_filter(client: TestClient, db: Session) -> None:
    owner, owner_headers, approver, approver_headers, leave_type = (
        _setup_owner_and_approver(client, db)
    )
    _create_and_submit_leave_request(client, owner_headers, leave_type)

    unread_resp = client.get(
        f"{settings.API_V1_STR}/notifications/?is_read=false", headers=approver_headers
    ).json()
    assert unread_resp["count"] >= 1
    assert all(not n["is_read"] for n in unread_resp["data"])

    read_resp = client.get(
        f"{settings.API_V1_STR}/notifications/?is_read=true", headers=approver_headers
    ).json()
    assert all(n["is_read"] for n in read_resp["data"])
