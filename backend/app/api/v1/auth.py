import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from ...schemas.auth import LoginRequest, LoginResponse, UserResponse, ChangePasswordRequest
from ...services.auth_service import AuthService
from ...services.activity_log_service import ActivityLogService
from ...core.enums import ActivityType
from ...core.dependencies import get_current_user, get_client_ip, get_user_agent, get_db
from ...models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    activity_service = ActivityLogService(db)
    result = auth_service.authenticate(login_data)
    
    user = db.query(User).filter(User.id == result.user.id).first()
    activity_service.log(
        user=user,
        activity_type=ActivityType.LOGIN,
        description=f"User '{result.user.username}' logged in",
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request)
    )
    return result


@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activity_service = ActivityLogService(db)
    activity_service.log(
        user=current_user,
        activity_type=ActivityType.LOGOUT,
        description=f"User '{current_user.username}' logged out",
        ip_address=get_client_ip(request)
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    auth_service.change_password(current_user, password_data.current_password, password_data.new_password)
    return {"message": "Password changed successfully"}
