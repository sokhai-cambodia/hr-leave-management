from fastapi import APIRouter

from app.api.routes import (
    items,
    leave_types,
    login,
    policies,
    private,
    public_holidays,
    teams,
    users,
    utils,
    leave_balances,
    leave_plan_requests,
    recommends,
    leave_requests,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
# api_router.include_router(items.router)
api_router.include_router(policies.router)
api_router.include_router(public_holidays.router)
api_router.include_router(leave_types.router)
api_router.include_router(teams.router)
api_router.include_router(recommends.router)
api_router.include_router(leave_balances.router)
api_router.include_router(leave_plan_requests.router)
api_router.include_router(leave_requests.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
