import mimetypes
import os
from datetime import date as date_type, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models import RoutineItem, Shift, ShiftUpload, User
from ..routine_ai import generate_routines
from ..schemas import (
    RoutineItemResponse,
    RoutineStatusUpdateRequest,
    ShiftBulkUpdateRequest,
    ShiftResponse,
    ShiftUploadCreateRequest,
    ShiftUploadResponse,
)
from ..shift_ocr import recognize_shifts

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
        status="processing",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    try:
        with open(file_path, "rb") as f:
            image_bytes = f.read()
        content_type = mimetypes.guess_type(file_path)[0] or "image/jpeg"

        recognized = recognize_shifts(image_bytes, content_type, note=payload.note)

        shifts = [
            Shift(
                user_id=current_user.id,
                upload_id=upload.id,
                work_date=item.work_date,
                shift_type=item.shift_type,
                start_time=item.start_time,
                end_time=item.end_time,
                needs_review=item.needs_review,
                review_message=item.review_message,
            )
            for item in recognized
        ]
        db.add_all(shifts)
        upload.status = "done"
    except Exception as e:
        upload.status = "failed"
        upload.error_message = str(e)

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

    update_items = [item for item in payload.shifts if item.id is not None]
    create_items = [item for item in payload.shifts if item.id is None]

    for item in create_items:
        if item.work_date is None or item.shift_type is None:
            raise HTTPException(
                status_code=400, detail="새로 추가하려면 work_date와 shift_type이 필요합니다"
            )
        db.add(
            Shift(
                user_id=current_user.id,
                upload_id=upload_id,
                work_date=item.work_date,
                shift_type=item.shift_type,
                start_time=item.start_time,
                end_time=item.end_time,
                needs_review=False,
            )
        )

    shift_ids = [item.id for item in update_items]
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

    for item in update_items:
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


@router.post(
    "/uploads/{upload_id}/routines", response_model=list[RoutineItemResponse], status_code=201
)
def generate_routines_for_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_upload(upload_id, current_user, db)

    shifts = (
        db.query(Shift)
        .filter(Shift.upload_id == upload_id, Shift.user_id == current_user.id)
        .order_by(Shift.work_date)
        .all()
    )
    if not shifts:
        raise HTTPException(status_code=400, detail="근무 일정이 없습니다")

    shifts_by_date = {shift.work_date: shift for shift in shifts}
    day_routines = generate_routines(shifts)

    routine_items = [
        RoutineItem(
            user_id=current_user.id,
            shift_id=shifts_by_date[day.work_date].id,
            category=item.type,
            title=item.label,
            description=item.note,
            start_time=item.time,
        )
        for day in day_routines
        if day.work_date in shifts_by_date
        for item in day.items
    ]

    db.add_all(routine_items)
    db.commit()
    for routine_item in routine_items:
        db.refresh(routine_item)

    return routine_items


@router.get("/routines/{work_date}", response_model=list[RoutineItemResponse])
def list_routines_for_date(
    work_date: date_type,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(RoutineItem)
        .join(Shift, RoutineItem.shift_id == Shift.id)
        .filter(Shift.work_date == work_date, RoutineItem.user_id == current_user.id)
        .order_by(RoutineItem.start_time)
        .all()
    )


@router.patch("/routines/{routine_id}", response_model=RoutineItemResponse)
def update_routine_status(
    routine_id: int,
    payload: RoutineStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routine_item = (
        db.query(RoutineItem)
        .filter(RoutineItem.id == routine_id, RoutineItem.user_id == current_user.id)
        .first()
    )
    if routine_item is None:
        raise HTTPException(status_code=404, detail="루틴 항목을 찾을 수 없습니다")

    routine_item.status = payload.status.value
    db.commit()
    db.refresh(routine_item)
    return routine_item
