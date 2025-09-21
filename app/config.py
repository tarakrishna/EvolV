from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB: str = "diet_app"
    JWT_SECRET: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 60  # minutes
    # Add the Groq API Key to your settings
    GROQ_API_KEY: str

    class Config:
        # This tells the app to load the keys from a .env file
        env_file = ".env"

settings = Settings()
