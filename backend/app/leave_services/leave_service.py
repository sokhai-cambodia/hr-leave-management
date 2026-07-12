from datetime import datetime, date
from typing import Any, Dict, Optional
import uuid

from sqlmodel import Session, select

from app.leave_models.leave_balance_model import LeaveBalance


class LeaveService:
    def __init__(self, session: Session, owner_id: uuid.UUID):
        self.session = session
        self.owner_id = owner_id

    def _require_context(self) -> None:
        if self.session is None or self.owner_id is None:
            raise ValueError(
                "Session and owner_id are required for balance operations."
            )

    def has_available_balance(
        self,
        *,
        leave_type_id: uuid.UUID,
        requested_days: float,
        year: str | None = None,
    ) -> bool:
        """Check if the user has enough available balance for the requested days."""
        self._require_context()
        year = year or str(date.today().year)

        balance = self.session.exec(
            select(LeaveBalance).where(
                LeaveBalance.owner_id == self.owner_id,
                LeaveBalance.leave_type_id == leave_type_id,
                LeaveBalance.year == year,
            )
        ).one_or_none()

        if not balance:
            return False

        return balance.available_balance >= requested_days

    def calculate_leave_days(self, payload: Any) -> float:
        """Validate dates and calculate total leave days between start and end date."""
        try:
            data = payload.model_dump() if hasattr(payload, "model_dump") else payload
            start_date = self._parse_date(data.get("start_date"))
            end_date = self._parse_date(data.get("end_date"))

            if start_date is None or end_date is None or start_date > end_date:
                return 0

            return (end_date - start_date).days + 1
        except (ValueError, AttributeError, TypeError):
            return 0

    def _parse_date(self, value: Any) -> Optional[date]:
        """Normalize a supported value into a date."""
        if value is None:
            return None
        if isinstance(value, date):
            return value
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d").date()
        return None
