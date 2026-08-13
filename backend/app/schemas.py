from datetime import datetime

from pydantic import BaseModel, field_validator


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


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    job_type: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
