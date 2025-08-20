from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional, Dict, Any
from datetime import date
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    AnnouncementListResponse,
    BusinessHours,
    BusinessHoursUpdate,
    SpecialHoliday,
    SpecialHolidayResponse
)
from app.services.announcement_service import AnnouncementService
from app.core.security import require_admin

router = APIRouter(prefix="/api/v1/announcements", tags=["お知らせ管理"])


@router.get("/", response_model=AnnouncementListResponse)
async def get_announcements(
    is_active_only: bool = Query(True, description="アクティブなお知らせのみ"),
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット")
):
    """
    お知らせ一覧を取得
    
    - **is_active_only**: アクティブなお知らせのみ取得
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    
    認証不要
    """
    return await AnnouncementService.get_announcements(is_active_only, limit, offset)


@router.get("/business-hours", response_model=List[BusinessHours])
async def get_business_hours():
    """
    営業時間を取得
    
    認証不要
    """
    return await AnnouncementService.get_business_hours()


@router.get("/special-holidays", response_model=List[SpecialHolidayResponse])
async def get_special_holidays(
    start_date: Optional[date] = Query(None, description="開始日"),
    end_date: Optional[date] = Query(None, description="終了日")
):
    """
    特別休業日一覧を取得
    
    - **start_date**: 開始日でフィルタ
    - **end_date**: 終了日でフィルタ
    
    認証不要
    """
    return await AnnouncementService.get_special_holidays(start_date, end_date)


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(announcement_id: str):
    """
    お知らせ詳細を取得
    
    - **announcement_id**: お知らせID
    
    認証不要
    """
    return await AnnouncementService.get_announcement(announcement_id)


# 管理者用エンドポイント
@router.post("/admin/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    お知らせを作成（管理者用）
    
    - **title**: タイトル
    - **content**: 内容
    - **priority**: 優先度（low/normal/high/urgent）
    - **is_active**: アクティブ状態
    
    管理者権限が必要です
    """
    return await AnnouncementService.create_announcement(announcement_data, admin_user["id"])


@router.put("/admin/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    announcement_data: AnnouncementUpdate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    お知らせを更新（管理者用）
    
    - **announcement_id**: お知らせID
    - **body**: 更新するお知らせ情報
    
    管理者権限が必要です
    """
    return await AnnouncementService.update_announcement(announcement_id, announcement_data)


@router.delete("/admin/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    お知らせを削除（管理者用）
    
    - **announcement_id**: お知らせID
    
    管理者権限が必要です
    """
    return await AnnouncementService.delete_announcement(announcement_id)


@router.put("/admin/business-hours")
async def update_business_hours(
    hours_data: BusinessHoursUpdate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    営業時間を更新（管理者用）
    
    - **hours**: 営業時間のリスト（曜日ごと）
    
    管理者権限が必要です
    """
    return await AnnouncementService.update_business_hours(hours_data.hours)


@router.post("/admin/special-holidays", response_model=SpecialHolidayResponse, status_code=status.HTTP_201_CREATED)
async def add_special_holiday(
    holiday_data: SpecialHoliday,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    特別休業日を追加（管理者用）
    
    - **holiday_date**: 休業日（YYYY-MM-DD形式）
    - **reason**: 理由（オプション）
    
    管理者権限が必要です
    """
    return await AnnouncementService.add_special_holiday(holiday_data)


@router.delete("/admin/special-holidays/{holiday_id}")
async def delete_special_holiday(
    holiday_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    特別休業日を削除（管理者用）
    
    - **holiday_id**: 特別休業日ID
    
    管理者権限が必要です
    """
    return await AnnouncementService.delete_special_holiday(holiday_id)