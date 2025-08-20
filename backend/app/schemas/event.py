from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EventRegistrationStatus(str, Enum):
    """イベント参加登録ステータス"""
    REGISTERED = "registered"   # 登録済み
    CANCELLED = "cancelled"     # キャンセル
    ATTENDED = "attended"       # 参加済み


class EventCreate(BaseModel):
    """イベント作成用スキーマ"""
    title: str
    description: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None
    max_participants: Optional[int] = None
    registration_deadline: Optional[datetime] = None


class EventUpdate(BaseModel):
    """イベント更新用スキーマ"""
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    max_participants: Optional[int] = None
    registration_deadline: Optional[datetime] = None


class EventRegistrationResponse(BaseModel):
    """イベント参加登録レスポンススキーマ"""
    id: str
    event_id: str
    user_id: str
    user_name: Optional[str]
    status: str
    registered_at: datetime
    cancelled_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    """イベントレスポンススキーマ"""
    id: str
    title: str
    description: Optional[str]
    event_date: datetime
    location: Optional[str]
    max_participants: Optional[int]
    registration_deadline: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime
    registration_count: int = 0
    is_registered: bool = False  # 現在のユーザーが登録しているか
    can_register: bool = True    # 登録可能か
    
    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    """イベント一覧レスポンススキーマ"""
    total: int
    items: List[EventResponse]
    page: int
    per_page: int