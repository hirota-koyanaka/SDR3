from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QRCodeRequest(BaseModel):
    """QRコード生成リクエストスキーマ"""
    dog_ids: List[str]


class QRCodeResponse(BaseModel):
    """QRコードレスポンススキーマ"""
    qr_code: str  # Base64エンコードされたQRコード画像
    token: str    # QRコードに含まれるトークン
    expires_at: datetime


class CheckInRequest(BaseModel):
    """入場リクエストスキーマ"""
    qr_token: str


class CheckOutRequest(BaseModel):
    """退場リクエストスキーマ"""
    entry_log_ids: List[str]


class EntryLogResponse(BaseModel):
    """入退場記録レスポンススキーマ"""
    id: str
    user_id: str
    user_name: Optional[str]
    dog_id: str
    dog_name: Optional[str]
    dog_breed: Optional[str]
    entry_time: datetime
    exit_time: Optional[datetime]
    checked_by: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CurrentVisitorsResponse(BaseModel):
    """現在の利用者レスポンススキーマ"""
    count: int
    visitors: List[EntryLogResponse]


class VisitorStatistics(BaseModel):
    """利用統計スキーマ"""
    total_today: int
    current_visitors: int
    peak_hour: Optional[str]
    average_stay_minutes: Optional[float]