"""Centralized enumerations used across the application."""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CASHIER = "cashier"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    BANK = "bank"
    JAZZCASH = "jazzcash"
    EASYPAISA = "easypaisa"
    OTHER = "other"


class ActivityType(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    CSV_IMPORT = "csv_import"
    PAYMENT_CREATED = "payment_created"
    RECEIPT_PRINTED = "receipt_printed"
    CUSTOMER_CREATED = "customer_created"
    CUSTOMER_UPDATED = "customer_updated"
    NOTE_CREATED = "note_created"
    NOTE_UPDATED = "note_updated"
    NOTE_DELETED = "note_deleted"
    SETTINGS_UPDATED = "settings_updated"
    ERROR = "error"
    OTHER = "other"
