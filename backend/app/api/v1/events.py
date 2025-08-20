from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional, Dict, Any
from datetime import date
from app.schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    EventRegistrationResponse
)
from app.services.event_service import EventService
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/events", tags=["イベント管理"])


@router.get("/", response_model=EventListResponse)
async def get_events(
    start_date: Optional[date] = Query(None, description="開始日"),
    end_date: Optional[date] = Query(None, description="終了日"),
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    イベント一覧を取得
    
    - **start_date**: 開始日でフィルタ
    - **end_date**: 終了日でフィルタ
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    
    認証は任意（登録状態の取得に使用）
    """
    user_id = current_user["id"] if current_user else None
    return await EventService.get_events(start_date, end_date, limit, offset, user_id)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    イベント詳細を取得
    
    - **event_id**: イベントID
    
    認証は任意（登録状態の取得に使用）
    """
    user_id = current_user["id"] if current_user else None
    return await EventService.get_event(event_id, user_id)


@router.post("/{event_id}/register", response_model=EventRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_event(
    event_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    イベントに参加登録
    
    - **event_id**: イベントID
    
    認証が必要です
    """
    return await EventService.register_event(event_id, current_user["id"])


@router.delete("/{event_id}/register")
async def cancel_registration(
    event_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    イベント参加をキャンセル
    
    - **event_id**: イベントID
    
    認証が必要です
    """
    return await EventService.cancel_registration(event_id, current_user["id"])


# 管理者用エンドポイント
@router.post("/admin/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    イベントを作成（管理者用）
    
    - **title**: イベントタイトル
    - **description**: イベント説明
    - **event_date**: イベント日時
    - **location**: 開催場所
    - **max_participants**: 最大参加人数
    - **registration_deadline**: 登録締切日時
    
    管理者権限が必要です
    """
    return await EventService.create_event(event_data, admin_user["id"])


@router.put("/admin/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    イベントを更新（管理者用）
    
    - **event_id**: イベントID
    - **body**: 更新するイベント情報
    
    管理者権限が必要です
    """
    return await EventService.update_event(event_id, event_data)


@router.get("/admin/{event_id}/registrations", response_model=List[EventRegistrationResponse])
async def get_event_registrations(
    event_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    イベントの参加者一覧を取得（管理者用）
    
    - **event_id**: イベントID
    
    管理者権限が必要です
    """
    return await EventService.get_event_registrations(event_id)