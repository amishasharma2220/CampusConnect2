
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CampusConnect"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # Auth
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Razorpay (use rzp_test_... keys outside production). Empty = payments
    # disabled: the order endpoint returns 503 instead of crashing.
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Observability
    LOG_LEVEL: str = "INFO"
    # "json" or "text". Empty = JSON when ENVIRONMENT is production/staging,
    # human-readable text otherwise.
    LOG_FORMAT: str = ""
    # Error tracking is off unless a DSN is set (Render env var, never committed).
    SENTRY_DSN: str = ""
    SENTRY_TRACES_SAMPLE_RATE: float = 0.0
    # Set automatically by Render on every deploy; used as the release name.
    RENDER_GIT_COMMIT: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
