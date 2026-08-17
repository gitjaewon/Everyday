from datetime import date, datetime, time
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class WorkPattern(str, Enum):
    fixed_day = "fixed_day"       # 고정 주간
    fixed_night = "fixed_night"   # 고정 야간
    rotation_2 = "rotation_2"     # 2교대
    rotation_3 = "rotation_3"     # 3교대
    custom = "custom"             # 직접 입력


class SignupRequest(BaseModel):
    name: str
    username: str
    password: str
    password_confirm: str
    terms_agreed: bool

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("비밀번호가 일치하지 않습니다")
        return v

    @field_validator("terms_agreed")
    @classmethod
    def must_agree_terms(cls, v):
        if not v:
            raise ValueError("개인정보 수집 동의가 필요합니다")
        return v


class LoginRequest(BaseModel):
    username: str
    password: str


class OnboardingRequest(BaseModel):
    work_pattern: WorkPattern


class UserProfileUpdateRequest(BaseModel):
    job_type: str = Field(min_length=1, max_length=50)

    @field_validator("job_type")
    @classmethod
    def normalize_job_type(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("직군을 입력해 주세요.")
        return value


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    job_type: str | None = None
    work_pattern: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ImageUploadResponse(BaseModel):
    image_url: str


class ShiftUploadCreateRequest(BaseModel):
    image_url: str
    note: str | None = None


class ShiftUploadResponse(BaseModel):
    id: int
    status: str
    note: str | None = None
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class ShiftResponse(BaseModel):
    id: int
    work_date: date
    shift_type: str
    start_time: time | None = None
    end_time: time | None = None
    needs_review: bool
    review_message: str | None = None

    class Config:
        from_attributes = True


class ShiftUpdateItem(BaseModel):
    id: int | None = None  # 없으면 새로 생성 (직접 입력)
    work_date: date | None = None  # id 없이 생성할 때 필수
    shift_type: str | None = None
    start_time: time | None = None
    end_time: time | None = None


class ShiftBulkUpdateRequest(BaseModel):
    shifts: list[ShiftUpdateItem]


class RoutineStatus(str, Enum):
    scheduled = "scheduled"   # 예정
    done = "done"             # 완료
    pending = "pending"       # 대기


class RoutineItemResponse(BaseModel):
    id: int
    shift_id: int
    category: str
    title: str
    description: str | None = None
    start_time: time | None = None
    end_time: time | None = None
    status: RoutineStatus

    class Config:
        from_attributes = True


class RoutineStatusUpdateRequest(BaseModel):
    status: RoutineStatus
