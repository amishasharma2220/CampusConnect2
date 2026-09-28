
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

    # CORS: only these browser origins may call the API. Comma-separated.
    # FRONTEND_URL is always included too.
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://campus-connect2-alpha.vercel.app"

    # Security
    # Comma-separated email domains allowed to self-register (as students).
    ALLOWED_SIGNUP_DOMAINS: str = "muj.manipal.edu"
    # Set to false only in tests.
    RATE_LIMIT_ENABLED: bool = True

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


    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL.strip():
            origins.append(self.FRONTEND_URL.strip().rstrip("/"))
        return sorted(set(origins))

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
