from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    """申請ステータス"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class DogInfo(BaseModel):
    """犬情報スキーマ"""
    name: str
    breed: Optional[str] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    personality: Optional[str] = None
    vaccine_certificate_url: Optional[str] = None


class ApplicationCreate(BaseModel):
    """申請作成用スキーマ"""
    email: EmailStr
    name: str
    phone: str
    address: str
    is_imabari_resident: bool
    residence_years: Optional[int] = None
    dog_info: List[DogInfo]
    preferred_date: Optional[datetime] = None


class ApplicationUpdate(BaseModel):
    """申請更新用スキーマ（管理者用）"""
    status: ApplicationStatus
    admin_memo: Optional[str] = None
    rejected_reason: Optional[str] = None


class ApplicationResponse(BaseModel):
    """申請レスポンススキーマ"""
    id: str
    email: str
    name: str
    phone: str
    address: str
    is_imabari_resident: bool
    residence_years: Optional[int]
    preferred_date: Optional[datetime]
    status: str
    admin_memo: Optional[str]
    rejected_reason: Optional[str]
    created_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[str]
    
    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """申請一覧レスポンススキーマ"""
    total: int
    items: List[ApplicationResponse]
    page: int
    per_page: int