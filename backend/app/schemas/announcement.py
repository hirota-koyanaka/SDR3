from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AnnouncementPriority(str, Enum):
    """お知らせ優先度"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class AnnouncementCreate(BaseModel):
    """お知らせ作成用スキーマ"""
    title: str
    content: str
    priority: AnnouncementPriority = AnnouncementPriority.NORMAL
    is_active: bool = True


class AnnouncementUpdate(BaseModel):
    """お知らせ更新用スキーマ"""
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[AnnouncementPriority] = None
    is_active: Optional[bool] = None


class AnnouncementResponse(BaseModel):
    """お知らせレスポンススキーマ"""
    id: str
    title: str
    content: str
    priority: str
    is_active: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    """お知らせ一覧レスポンススキーマ"""
    total: int
    items: List[AnnouncementResponse]
    page: int
    per_page: int


class BusinessHours(BaseModel):
    """営業時間スキーマ"""
    day_of_week: int  # 0=日曜, 1=月曜, ... 6=土曜
    open_time: Optional[str]  # HH:MM形式
    close_time: Optional[str]  # HH:MM形式
    is_closed: bool = False


class BusinessHoursUpdate(BaseModel):
    """営業時間更新用スキーマ"""
    hours: List[BusinessHours]


class SpecialHoliday(BaseModel):
    """特別休業日スキーマ"""
    holiday_date: str  # YYYY-MM-DD形式
    reason: Optional[str] = None


class SpecialHolidayResponse(SpecialHoliday):
    """特別休業日レスポンススキーマ"""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True