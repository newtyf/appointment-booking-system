from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Settings for the application.
    This class is used to load environment variables and provide
    default values for the application configuration.
    """

    echo_sql: bool = True
    test: bool = False
    project_name: str = "My FastAPI project"
    oauth_token_secret: str = "my_dev_secret"
    API_PREFIX: str = "/api"
    MYSQL_DB_PASSWORD: str | None = None
    MYSQL_DB_USER: str | None = None
    MYSQL_DB_HOST: str | None = None
    MYSQL_DB_PORT: int | None = None
    MYSQL_DB_NAME: str | None = None
    ENVIRONMENT: str | None = None
    SECRET_KEY: str = "test" # Clave secreta para JWT
    ALGORITHM: str = "HS256" # Algoritmo de JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Tiempo de expiración del token de acceso
    REPLICATE_API_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

settings = Settings()