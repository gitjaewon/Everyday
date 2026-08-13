from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """환경변수로 주입되는 설정값. .env 파일에서도 읽는다."""

    # Claude API
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5"

    # 인증
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7일

    # 파일 업로드
    upload_dir: str = "./data/uploads"

    class Config:
        env_file = ".env"


settings = Settings()
