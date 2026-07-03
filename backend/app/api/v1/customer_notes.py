from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ...schemas.customer_note import NoteCreate, NoteResponse
from ...core.dependencies import get_current_user, get_current_admin, get_db
from ...models.user import User
from ...models.customer_note import CustomerNote
from ...core.exceptions import NotFoundError

router = APIRouter(prefix="/notes", tags=["Customer Notes"])


@router.get("/customer/{customer_id}", response_model=List[NoteResponse])
def get_customer_notes(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notes for a customer."""
    notes = db.query(CustomerNote).filter(
        CustomerNote.customer_id == customer_id
    ).order_by(CustomerNote.created_at.desc()).all()
    return notes


@router.post("/", response_model=NoteResponse)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a note to a customer (Admin only)."""
    note = CustomerNote(
        customer_id=note_data.customer_id,
        title=note_data.title,
        message=note_data.message,
        created_by=current_user.id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a note (Admin only)."""
    note = db.query(CustomerNote).filter(CustomerNote.id == note_id).first()
    if not note:
        raise NotFoundError("Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}
