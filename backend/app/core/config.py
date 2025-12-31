from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = Field("fromscratch", alias="APP_NAME")
    app_env: str = Field("dev", alias="APP_ENV")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # JWT Configuration (must match FromScratch-auth JWT_ACCESS_SECRET)
    JWT_ACCESS_SECRET: str = Field(..., alias="JWT_ACCESS_SECRET")

    mongodb_uri: str | None = Field(None, alias="MONGODB_URI")
    cors_origins: str | None = Field(None, alias="CORS_ORIGINS")

    redis_url: str = "redis://localhost:6379/0"
    
    model_provider: str = Field("openai", alias="MODEL_PROVIDER")
    #openai_api_key: str | None = Field(None, alias="OPENAI_API_KEY")
    #litellm_model: str = Field("gpt-4o-mini", alias="LITELLM_MODEL")

    # OpenAI / GPT / GPT-4o Mini
    openai_api_key: str | None = Field(None, alias="OPENAI_API_KEY")
    litellm_model: str = Field("gpt-4o-mini", alias="LITELLM_MODEL")

    # NVIDIA / DeepSeek
    nvidia_api_key: str | None = Field(None, alias="NVIDIA_API_KEY")
    nvidia_model: str | None = Field("deepseek-ai/deepseek-r1", alias="NVIDIA_MODEL")

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        """Return a list of CORS origins parsed from `CORS_ORIGINS` env var.

        The env var can be a single origin or a comma-separated list. If not
        provided, defaults to ['*'] (same behaviour as before).
        """
        if not self.cors_origins:
            return ["*"]
        if isinstance(self.cors_origins, str):
            return [s.strip() for s in self.cors_origins.split(",") if s.strip()]
        return list(self.cors_origins)

settings = Settings()

def get_settings() -> Settings:
    """Get application settings."""
    return settings
