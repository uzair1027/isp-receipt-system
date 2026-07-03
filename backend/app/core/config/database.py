from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    DATABASE_URL: str = "sqlite:///./isp_receipts.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5
    DB_ECHO: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


database_config = DatabaseConfig()
