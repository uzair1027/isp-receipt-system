import logging
import json
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from ..models.activity_log import ActivityLog, ActivityType
from ..models.user import User

logger = logging.getLogger(__name__)


class ActivityLogService:
    def __init__(self, db: Session):
        self.db = db
    
    def log(
        self,
        user: Optional[User],
        activity_type: ActivityType,
        description: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[ActivityLog]:
        try:
            activity = ActivityLog(
                user_id=user.id if user else None,
                activity_type=activity_type,
                description=description,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata_json=json.dumps(metadata) if metadata else None
            )
            self.db.add(activity)
            self.db.commit()
            self.db.refresh(activity)
            logger.info(f"Activity: {activity_type.value} - {description[:100]}")
            return activity
        except Exception as e:
            logger.error(f"Failed to log activity: {str(e)}")
            self.db.rollback()
            return None
