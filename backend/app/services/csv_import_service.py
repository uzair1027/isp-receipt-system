import csv
import io
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..repositories.customer_repository import CustomerRepository
from ..repositories.import_repository import ImportRepository
from ..models.customer import Customer
from ..core.constants import CSV_REQUIRED_FIELDS

logger = logging.getLogger(__name__)


class CSVImportService:
    def __init__(self, db: Session):
        self.db = db
        self.customer_repo = CustomerRepository(db)
        self.import_repo = ImportRepository(db)

    def _parse_date(self, date_str: str):
        """Parse various date formats from Zima.cloud CSV."""
        if not date_str:
            return None
        date_str = date_str.strip()
        formats = [
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%m/%d/%Y',
            '%a, %b %d, %Y',
            '%a, %b %d, %Y %I:%M %p',
            '%a, %b %d, %Y %I:%M:%S %p',
            '%d-%b-%Y',
            '%b %d, %Y',
            '%d/%m/%y',
            '%m/%d/%y',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        # Try splitting off time portion
        parts = date_str.split('  ')
        if len(parts) > 1:
            return self._parse_date(parts[0])
        logger.warning(f"Could not parse date: {date_str}")
        return None

    def import_csv(self, file_content: bytes, file_name: str, user_id: int) -> Dict[str, Any]:
        imported = 0
        updated = 0
        skipped = 0
        errors = 0
        error_details = []
        total_rows = 0

        try:
            content = file_content.decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(content))
            rows = list(reader)
            total_rows = len(rows)

            for row_num, row in enumerate(rows, start=2):
                try:
                    device_ppp = row.get('Device/PPP', '').strip()
                    if not device_ppp:
                        skipped += 1
                        continue

                    customer_data = {
                        'device_ppp': device_ppp,
                        'username': row.get('Username', '').strip() or None,
                        'full_name': row.get('Full Name', '').strip() or 'Unknown',
                        'service_plan': row.get('Service Plan', '').strip() or None,
                        'mobile_phone': row.get('Mobile Phone', '').strip() or None,
                        'address': row.get('Address', '').strip() or None,
                        'street': row.get('Street', '').strip() or None,
                        'email': row.get('Email', '').strip() or None,
                        'national_id': row.get('National ID', '').strip() or None,
                        'mac_address': row.get('MAC Address', '').strip() or None,
                        'comments': row.get('Comments', '').strip() or None,
                    }

                    # Parse expiry date
                    expiry_str = row.get('Expiry Date', '').strip()
                    if expiry_str:
                        parsed = self._parse_date(expiry_str)
                        if parsed:
                            customer_data['expiry_date'] = parsed

                    # Parse created at
                    csv_created = row.get('Created At', '').strip()
                    if csv_created:
                        try:
                            customer_data['csv_created_at'] = datetime.strptime(csv_created, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass

                    existing = self.customer_repo.get_by_device_ppp(device_ppp)

                    if existing:
                        self.customer_repo.update(existing.id, customer_data)
                        updated += 1
                    else:
                        self.customer_repo.create(customer_data)
                        imported += 1

                except Exception as e:
                    errors += 1
                    error_details.append(f"Row {row_num}: {str(e)}")
                    logger.error(f"Error importing row {row_num}: {str(e)}")

            import_log = self.import_repo.create({
                'file_name': file_name,
                'imported_by': user_id,
                'total_rows': total_rows,
                'imported_count': imported,
                'updated_count': updated,
                'skipped_count': skipped,
                'error_count': errors,
                'error_details': '\n'.join(error_details) if error_details else None,
            })

            return {
                'success': True,
                'import_log': import_log,
                'message': f'Imported: {imported}, Updated: {updated}, Skipped: {skipped}, Errors: {errors}'
            }

        except Exception as e:
            logger.error(f"CSV import failed: {str(e)}")
            raise