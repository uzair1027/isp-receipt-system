from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ...core.dependencies import get_current_admin, get_db
from ...models.user import User, UserRole
from ...core.security import get_password_hash
from ...core.exceptions import ConflictError

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "full_name": u.full_name, "role": u.role.value, "is_active": u.is_active} for u in users]

@router.post("/")
def create_user(data: dict, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == data["username"]).first()
    if existing:
        raise ConflictError("Username already exists")
    user = User(
        username=data["username"],
        full_name=data["full_name"],
        password_hash=get_password_hash(data["password"]),
        role=UserRole(data["role"].upper())
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "id": user.id}

@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        return {"error": "Cannot delete yourself"}
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    return {"message": "User deleted"}
