from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = Field("fromscratch", alias="APP_NAME")
    app_env: str = Field("dev", alias="APP_ENV")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    database_url: str = Field(..., alias="DATABASE_URL")
    redis_url: str = Field(..., alias="REDIS_URL")

    storage_endpoint: str = Field(..., alias="STORAGE_ENDPOINT")
    storage_access_key: str = Field(..., alias="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field(..., alias="STORAGE_SECRET_KEY")
    storage_bucket: str = Field("fromscratch", alias="STORAGE_BUCKET")

    model_provider: str = Field("openai", alias="MODEL_PROVIDER")
    openai_api_key: str | None = Field(None, alias="OPENAI_API_KEY")
    litellm_model: str = Field("gpt-4o-mini", alias="LITELLM_MODEL")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
