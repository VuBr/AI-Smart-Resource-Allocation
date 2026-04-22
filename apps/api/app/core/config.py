from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/app"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # LLM (stub in Phase 5)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""    
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_MAX_TOKENS: int = 2048
    LLM_TEMPERATURE: float = 0.2
    LLM_CONCURRENCY: int = 10

    # JWT (stub in Phase 5)
    # TODO: Replace with real JWT auth before production
    JWT_SECRET: str = "change-me-before-production"
    JWT_ACCESS_EXPIRE_HOURS: int = 24
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    # Application limits
    MAX_CSV_SIZE_MB: int = 10
    BENCH_ALERT_DAYS_THRESHOLD: int = 30
    SHORTAGE_SCORE_THRESHOLD: float = 0.5

    # Cache TTLs (seconds)
    LLM_CACHE_TTL: int = 86400
    BENCH_CACHE_TTL: int = 3600
    ENGINEER_CACHE_TTL: int = 300
    PROJECT_CACHE_TTL: int = 1800


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
