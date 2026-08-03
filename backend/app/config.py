from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Auth
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # Database
    database_url: str = "sqlite:///./mompeace.db"

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    gemini_daily_call_limit: int = 30  # 개발 중 실수로 반복 호출돼 과금되는 걸 막기 위한 하루 상한

    # 식약처 (MFDS) 공공데이터
    mfds_api_key: str = ""


settings = Settings()