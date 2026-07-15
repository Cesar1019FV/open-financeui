"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Finance Backend"
    debug: bool = False
    secret_key: str = "change-me-please-generate-a-secure-random-key-of-at-least-32-chars"
    access_token_expire_days: int = 7
    algorithm: str = "HS256"
    database_url: str = "sqlite:///./data/finance.db"
    cors_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 120
    seed_demo_user: bool = False
    demo_user_email: str = "demo@example.com"
    demo_user_password: str = "demodemo"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
