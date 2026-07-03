from functools import wraps
from fastapi import HTTPException, status
from .enums import UserRole


def require_admin(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        current_user = kwargs.get('current_user')
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        return await func(*args, **kwargs)
    return wrapper


def is_admin(user) -> bool:
    return user and user.role == UserRole.ADMIN


def can_modify_notes(user) -> bool:
    return is_admin(user)


def can_delete_payments(user) -> bool:
    return is_admin(user)


def can_manage_users(user) -> bool:
    return is_admin(user)
