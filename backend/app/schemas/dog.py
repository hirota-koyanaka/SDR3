from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class VaccinationRecordBase(BaseModel):
    """ワクチン接種記録ベーススキーマ"""
    vaccine_type: str
    vaccination_date: date
    certificate_url: Optional[str] = None
    next_vaccination_date: Optional[date] = None


class VaccinationRecordCreate(VaccinationRecordBase):
    """ワクチン接種記録作成用スキーマ"""
    pass


class VaccinationRecordResponse(VaccinationRecordBase):
    """ワクチン接種記録レスポンススキーマ"""
    id: str
    dog_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DogBase(BaseModel):
    """犬情報ベーススキーマ"""
    name: str
    breed: Optional[str] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    personality: Optional[str] = None


class DogCreate(DogBase):
    """犬情報作成用スキーマ"""
    photo_url: Optional[str] = None


class DogUpdate(BaseModel):
    """犬情報更新用スキーマ"""
    name: Optional[str] = None
    breed: Optional[str] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    personality: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: Optional[bool] = None


class DogResponse(DogBase):
    """犬情報レスポンススキーマ"""
    id: str
    user_id: str
    photo_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    vaccination_records: List[VaccinationRecordResponse] = []
    
    class Config:
        from_attributes = True


class DogListResponse(BaseModel):
    """犬情報一覧レスポンススキーマ"""
    total: int
    items: List[DogResponse]