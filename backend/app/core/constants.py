"""Application-wide constants."""

RECEIPT_PREFIX = "RCP"
RECEIPT_SEQUENCE_START = 1
DEFAULT_CURRENCY = "PKR"
DEFAULT_CURRENCY_SYMBOL = "Rs."
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
MAX_UPLOAD_SIZE_MB = 10
ALLOWED_CSV_EXTENSIONS = {".csv"}
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif"}
CSV_REQUIRED_FIELDS = ["Device/PPP", "Full Name"]
CSV_OPTIONAL_FIELDS = [
    "Username", "Service Plan", "Mobile Phone", "Address", "Street",
    "Expiry Date", "Comments", "Email", "National ID", "MAC Address", "Created At"
]
PAYMENT_METHODS = ["cash", "bank", "jazzcash", "easypaisa", "other"]
BILLING_MONTH_FORMAT = "%Y-%m"
DATE_FORMAT = "%Y-%m-%d"
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
