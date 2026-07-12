import uuid
from datetime import date

from sqlmodel import Session, select

from app.leave_models.leave_balance_model import LeaveBalance, LeaveBalanceCreate
from app.leave_models.leave_type_model import LeaveType


class BalanceService:
    def __init__(self, session: Session, owner_id: uuid.UUID):
        self.session = session
        self.owner_id = owner_id

    def _require_context(self) -> None:
        if self.session is None or self.owner_id is None:
            raise ValueError(
                "Session and owner_id are required for balance operations."
            )

    def debit_balance(
        self,
        *,
        owner_id: uuid.UUID,
        amount: float,
        leave_type_id: uuid.UUID,
        year: str | None = None
    ) -> float:
        self._require_context()

        year = year or str(date.today().year)

        statement = select(LeaveBalance).where(
            LeaveBalance.owner_id == owner_id,
            LeaveBalance.leave_type_id == leave_type_id,
            LeaveBalance.year == year,
        )
        balance = self.session.exec(statement).first()

        if not balance or balance.available_balance < amount:
            raise ValueError("Insufficient balance for this operation.")

        balance.taken_balance = balance.taken_balance + amount

        self.session.add(balance)
        self.session.commit()

        return balance.available_balance

    def credit_balance(
        self,
        *,
        owner_id: uuid.UUID,
        amount: float,
        leave_type_id: uuid.UUID,
        year: str | None = None
    ) -> float:
        self._require_context()

        year = year or str(date.today().year)

        statement = select(LeaveBalance).where(
            LeaveBalance.owner_id == owner_id,
            LeaveBalance.leave_type_id == leave_type_id,
            LeaveBalance.year == year,
        )
        balance = self.session.exec(statement).first()

        if not balance or balance.taken_balance < amount:
            raise ValueError("Insufficient balance for this operation.")

        balance.taken_balance = balance.taken_balance - amount

        self.session.add(balance)
        self.session.commit()

        return balance.available_balance

    def generate_balance(self, *, year: str | None = None):
        self._require_context()

        year = year or str(date.today().year)

        leave_types = self.session.exec(select(LeaveType)).all()
        for leave_type in leave_types:

            row_in = LeaveBalanceCreate(
                year=year,
                balance=leave_type.entitlement,
                leave_type_id=leave_type.id,
                owner_id=self.owner_id,
            )

            exists_statement = select(LeaveBalance).where(
                LeaveBalance.owner_id == self.owner_id,
                LeaveBalance.year == year,
                LeaveBalance.leave_type_id == leave_type.id,
            )
            exists = self.session.exec(exists_statement).first()

            if not exists:
                row = LeaveBalance.model_validate(row_in)
                self.session.add(row)
                self.session.commit()
