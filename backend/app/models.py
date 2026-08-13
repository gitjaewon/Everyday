from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """사용자. 교대근무자 본인."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    job_type = Column(String)  # 간호사 / 소방관 / 공장 근로자 등
    terms_agreed = Column(Boolean, default=False)  # 개인정보 수집 동의
    created_at = Column(DateTime, default=datetime.utcnow)

    uploads = relationship("ShiftUpload", back_populates="user")
    shifts = relationship("Shift", back_populates="user")
    routine_items = relationship("RoutineItem", back_populates="user")
    alerts = relationship("Alert", back_populates="user")


class ShiftUpload(Base):
    """업로드한 근무표 사진과 AI 인식 처리 상태."""

    __tablename__ = "shift_uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending / processing / done / failed
    error_message = Column(String)  # 인식 실패 시 원인
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploads")
    shifts = relationship("Shift", back_populates="upload")


class Shift(Base):
    """하루치 근무 일정. AI 인식 결과이거나 사용자가 직접 입력한 것."""

    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    upload_id = Column(Integer, ForeignKey("shift_uploads.id"))  # 수동 입력이면 비어 있음
    work_date = Column(Date, nullable=False, index=True)
    shift_type = Column(String, nullable=False)  # day / evening / night / off
    start_time = Column(Time)
    end_time = Column(Time)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="shifts")
    upload = relationship("ShiftUpload", back_populates="shifts")
    routine_items = relationship("RoutineItem", back_populates="shift")


class RoutineItem(Base):
    """근무 유형에 맞춰 제안된 일일 루틴 항목."""

    __tablename__ = "routine_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    category = Column(String, nullable=False)  # sleep / meal / caffeine / exercise
    title = Column(String, nullable=False)
    description = Column(String)
    start_time = Column(Time)
    end_time = Column(Time)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="routine_items")
    shift = relationship("Shift", back_populates="routine_items")


class Alert(Base):
    """신체 이상 징후 발생 기록과 추천 대처법."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # high_heart_rate / drowsiness
    heart_rate = Column(Integer)  # 심박수 관련 알림일 때의 측정값
    drowsiness_level = Column(Integer)  # 졸음 관련 알림일 때의 위험도 (0~10)
    message = Column(String, nullable=False)  # 무슨 일이 감지됐는지
    recommendation = Column(String)  # 추천 대처법
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
