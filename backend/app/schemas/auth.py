from datetime import date

from pydantic import Field

from app.schemas.base import CamelModel


class RegisterRequest(CamelModel):
    login_id: str
    password: str
    nickname: str


class LoginRequest(CamelModel):
    login_id: str
    password: str


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(CamelModel):
    id: int
    login_id: str
    nickname: str
    pregnancy_week: int
    pregnancy_day: int
    due_date: date | None = None
    allergy_info: str = ""


class OnboardingRequest(CamelModel):
    pregnancy_week: int = Field(ge=0, le=42)
    pregnancy_day: int = Field(ge=0, le=6)
    due_date: date
