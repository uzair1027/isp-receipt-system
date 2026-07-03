import logging
from sqlalchemy.orm import Session
from ..models.user import User, UserRole
from ..schemas.auth import LoginRequest, LoginResponse, UserResponse
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.config import auth_config
from ..core.exceptions import AuthenticationError
from ..repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
    
    def authenticate(self, login_data: LoginRequest) -> LoginResponse:
        user = self.user_repo.get_active_by_username(login_data.username)
        
        if not user or not verify_password(login_data.password, user.password_hash):
            logger.warning(f"Failed login attempt for username: {login_data.username}")
            raise AuthenticationError("Invalid username or password")
        
        expires_in = auth_config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        token = create_access_token(data={
            "sub": str(user.id),
            "username": user.username,
            "role": user.role.value
        })
        
        logger.info(f"User '{user.username}' logged in successfully")
        
        return LoginResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_in,
            user=UserResponse.model_validate(user)
        )
    
    def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")
        user.password_hash = get_password_hash(new_password)
        self.db.commit()
        logger.info(f"User '{user.username}' changed password")
    
    def seed_admin(self) -> None:
        admin = self.user_repo.get_by_username(auth_config.ADMIN_USERNAME)
        if not admin:
            admin_data = {
                "username": auth_config.ADMIN_USERNAME,
                "full_name": "System Administrator",
                "password_hash": get_password_hash(auth_config.ADMIN_PASSWORD),
                "role": UserRole.ADMIN,
                "is_active": True
            }
            self.user_repo.create(admin_data)
            logger.info(f"Default admin user '{auth_config.ADMIN_USERNAME}' created")
