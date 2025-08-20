from pydantic_settings import BaseSettings
from typing import List, Optional
import json


class Settings(BaseSettings):
    # Supabase設定
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # JWT設定
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS設定
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Redis設定（オプション）
    REDIS_URL: Optional[str] = None
    
    # 環境設定
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'BACKEND_CORS_ORIGINS':
                try:
                    return json.loads(raw_val)
                except json.JSONDecodeError:
                    return [item.strip() for item in raw_val.split(',')]
            return raw_val


settings = Settings()