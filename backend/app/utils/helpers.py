from datetime import datetime, date
from typing import Optional
import json


def get_current_year_month() -> str:
    return datetime.now().strftime("%Y-%m")


def get_current_year() -> int:
    return datetime.now().year


def parse_date(date_str: Optional[str]) -> Optional[date]:
    if not date_str:
        return None
    formats = ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def format_currency(amount: float, symbol: str = "Rs.") -> str:
    return f"{symbol} {amount:,.2f}"
