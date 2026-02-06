"""
Application Configuration using Pydantic Settings.
Loads environment variables from .env file.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "ISRS Database API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    ASYNC_DATABASE_URL: str = Field(..., env="ASYNC_DATABASE_URL")

    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours (safer default)
    SESSION_INACTIVITY_TIMEOUT_MINUTES: int = 480  # 8 hours inactivity timeout (increased for admin work)

    # CORS (stored as comma-separated string, accessed as list via property)
    cors_origins_str: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    @property
    def CORS_ORIGINS(self) -> list[str]:
        """Parse comma-separated CORS origins into list."""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]

    # Email
    SMTP_HOST: str = Field(..., env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: str = Field(..., env="SMTP_USER")
    SMTP_PASSWORD: str = Field(..., env="SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = Field(..., env="SMTP_FROM_EMAIL")
    SMTP_FROM_NAME: str = "ISRS Platform"

    # Magic Links
    MAGIC_LINK_EXPIRY_MINUTES: int = 15
    MAGIC_LINK_BASE_URL: str = Field(..., env="MAGIC_LINK_BASE_URL")

    # External APIs
    APOLLO_API_KEY: Optional[str] = Field(default=None, env="APOLLO_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")

    # Stripe Payment Processing
    STRIPE_SECRET_KEY: Optional[str] = Field(default=None, env="STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(default=None, env="STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET: str = Field(default=None, env="STRIPE_WEBHOOK_SECRET")

    # AWS Configuration
    EMAIL_SERVICE: str = Field(default="smtp", env="EMAIL_SERVICE")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    AWS_SES_REGION: str = Field(default="us-east-1", env="AWS_SES_REGION")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    INBOUND_EMAIL_BUCKET: str = Field(default="isrs-inbound-emails", env="INBOUND_EMAIL_BUCKET")
    SES_FROM_EMAIL: Optional[str] = Field(default=None, env="SES_FROM_EMAIL")

    # File Uploads
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
