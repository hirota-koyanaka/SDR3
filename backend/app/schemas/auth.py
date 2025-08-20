from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    """ユーザー登録用スキーマ"""
    email: EmailStr
    password: str
    name: str
    phone: str
    address: str
    is_imabari_resident: bool = False
    residence_years: Optional[int] = None


class UserLogin(BaseModel):
    """ログイン用スキーマ"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """トークンレスポンススキーマ"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """トークンリフレッシュ用スキーマ"""
    refresh_token: str


class UserResponse(BaseModel):
    """ユーザーレスポンススキーマ"""
    id: str
    email: str
    name: str
    phone: Optional[str]
    address: Optional[str]
    is_imabari_resident: bool
    residence_years: Optional[int]
    status: str
    avatar_url: Optional[str]
    
    class Config:
        from_attributes = True