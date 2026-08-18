from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """환경변수로 주입되는 설정값. .env 파일에서도 읽는다."""

    # OpenAI API
    api_key: str = ""
    model: str = "gpt-4o"

    # 인증
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7일

    # 파일 업로드
    upload_dir: str = "./data/uploads"

    # 콤마로 구분된 허용 출처 목록. 개발 중엔 비워두면 전부 허용, 배포 시 실제 프론트 도메인으로 채운다.
    # 예: CORS_ORIGINS=https://harugyeol.com,https://www.harugyeol.com
    cors_origins: str = ""

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return origins or ["*"]


settings = Settings()
