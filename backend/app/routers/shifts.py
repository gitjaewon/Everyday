import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models import Shift, ShiftUpload, User
from ..schemas import (
    ShiftBulkUpdateRequest,
    ShiftResponse,
    ShiftUploadCreateRequest,
    ShiftUploadResponse,
)

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.post("/uploads", response_model=ShiftUploadResponse, status_code=201)
def create_shift_upload(
    payload: ShiftUploadCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # image_url 형태: /images/{filename}
    filename = os.path.basename(payload.image_url)
    if not filename.startswith(f"{current_user.id}_"):
        raise HTTPException(status_code=400, detail="유효하지 않은 이미지 URL입니다")

    file_path = os.path.join(settings.upload_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="이미지를 찾을 수 없습니다")

    upload = ShiftUpload(
        user_id=current_user.id,
        image_path=file_path,
        note=payload.note,
        status="pending",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return ShiftUploadResponse(
        id=upload.id,
        status=upload.status,
        note=upload.note,
        image_url=payload.image_url,
        created_at=upload.created_at,
    )


def _get_owned_upload(upload_id: int, current_user: User, db: Session) -> ShiftUpload:
    upload = (
        db.query(ShiftUpload)
        .filter(ShiftUpload.id == upload_id, ShiftUpload.user_id == current_user.id)
        .first()
    )
    if upload is None:
        raise HTTPException(status_code=404, detail="업로드 기록을 찾을 수 없습니다")
    return upload


@router.get("/uploads/{upload_id}/shifts", response_model=list[ShiftResponse])
def list_shifts_for_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_upload(upload_id, current_user, db)
    return (
        db.query(Shift)
        .filter(Shift.upload_id == upload_id, Shift.user_id == current_user.id)
        .order_by(Shift.work_date)
        .all()
    )


@router.patch("/uploads/{upload_id}/shifts", response_model=list[ShiftResponse])
def update_shifts(
    upload_id: int,
    payload: ShiftBulkUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_upload(upload_id, current_user, db)

    shift_ids = [item.id for item in payload.shifts]
    shifts = (
        db.query(Shift)
        .filter(
            Shift.id.in_(shift_ids),
            Shift.upload_id == upload_id,
            Shift.user_id == current_user.id,
        )
        .all()
    )
    shifts_by_id = {s.id: s for s in shifts}

    missing = set(shift_ids) - shifts_by_id.keys()
    if missing:
        raise HTTPException(status_code=404, detail=f"근무 일정을 찾을 수 없습니다: {sorted(missing)}")

    for item in payload.shifts:
        shift = shifts_by_id[item.id]
        if item.shift_type is not None:
            shift.shift_type = item.shift_type
        if item.start_time is not None:
            shift.start_time = item.start_time
        if item.end_time is not None:
            shift.end_time = item.end_time

        # 사용자가 직접 고쳤으니 더 이상 검토가 필요하지 않다
        shift.needs_review = False
        shift.review_message = None

    db.commit()

    return (
        db.query(Shift)
        .filter(Shift.upload_id == upload_id, Shift.user_id == current_user.id)
        .order_by(Shift.work_date)
        .all()
    )


@router.post("/uploads/{upload_id}/confirm", response_model=ShiftUploadResponse)
def confirm_shift_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = _get_owned_upload(upload_id, current_user, db)
    upload.confirmed_at = datetime.utcnow()
    db.commit()
    db.refresh(upload)

    return ShiftUploadResponse(
        id=upload.id,
        status=upload.status,
        note=upload.note,
        image_url=f"/images/{os.path.basename(upload.image_path)}",
        created_at=upload.created_at,
    )
