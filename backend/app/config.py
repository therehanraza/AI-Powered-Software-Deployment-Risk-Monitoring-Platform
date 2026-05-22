import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)


class Settings:
    port: int = int(os.getenv("PORT", "5000"))
    mongo_uri: str = os.getenv("MONGO_URI", "")
    mongo_db_name: str = os.getenv("MONGO_DB_NAME", "deployment_risk_ai")
    jwt_secret: str = os.getenv("JWT_SECRET", "development_jwt_secret")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
    fallback_gemini_model: str = os.getenv("FALLBACK_GEMINI_MODEL", "gemini-2.5-flash-lite")
    node_env: str = os.getenv("NODE_ENV", "development")
    client_url: str = os.getenv("CLIENT_URL", "http://localhost:3000")


settings = Settings()
