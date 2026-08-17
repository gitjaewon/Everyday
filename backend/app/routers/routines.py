from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Alert, RoutineItem, Shift, User
from ..routine_ai import generate_redesigned_routines
from ..schemas import RoutineRedesignRequest, RoutineRedesignResponse

router = APIRouter(prefix="/routines", tags=["routines"])


@router.post("/redesign", response_model=list[RoutineRedesignResponse])
def redesign_routines(
    payload: RoutineRedesignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.alert_id is not None:
        alert = (
            db.query(Alert)
            .filter(Alert.id == payload.alert_id, Alert.user_id == current_user.id)
            .first()
        )
        if alert is None:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")

    routine_items = (
        db.query(RoutineItem)
        .join(Shift, RoutineItem.shift_id == Shift.id)
        .filter(
            RoutineItem.user_id == current_user.id,
            Shift.work_date == payload.work_date,
        )
        .order_by(RoutineItem.start_time)
        .all()
    )
    return generate_redesigned_routines(
        routine_items,
        payload.incident_type,
        payload.start_time,
        payload.end_time,
    )
