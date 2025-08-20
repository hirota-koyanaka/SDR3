from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.schemas.dog import DogResponse


class UserProfileUpdate(BaseModel):
    """ユーザープロフィール更新用スキーマ"""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_imabari_resident: Optional[bool] = None
    residence_years: Optional[int] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    """ユーザープロフィールレスポンススキーマ"""
    id: str
    auth_id: str
    email: str
    name: str
    phone: Optional[str]
    address: Optional[str]
    is_imabari_resident: bool
    residence_years: Optional[int]
    status: str
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    dogs: List[DogResponse] = []
    
    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """ユーザー一覧レスポンススキーマ（管理者用）"""
    total: int
    items: List[UserProfileResponse]
    page: int
    per_page: int


class UserStatusUpdate(BaseModel):
    """ユーザーステータス更新用スキーマ（管理者用）"""
    status: str  # pending, active, suspended