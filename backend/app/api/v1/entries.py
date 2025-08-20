from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional, Dict, Any
from datetime import date
from app.schemas.entry import (
    QRCodeRequest,
    QRCodeResponse,
    CheckInRequest,
    CheckOutRequest,
    EntryLogResponse,
    CurrentVisitorsResponse,
    VisitorStatistics
)
from app.services.entry_service import EntryService
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/entries", tags=["入退場管理"])


@router.post("/qr", response_model=QRCodeResponse)
async def generate_qr_code(
    request: QRCodeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    入場用QRコードを生成
    
    - **dog_ids**: 入場する犬のIDリスト
    
    認証が必要です
    """
    return await EntryService.generate_qr_code(current_user["id"], request.dog_ids)


@router.post("/check-in", status_code=status.HTTP_201_CREATED)
async def check_in(
    request: CheckInRequest,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    入場処理（管理者がQRスキャン）
    
    - **qr_token**: QRコードに含まれるトークン
    
    管理者権限が必要です
    """
    return await EntryService.check_in(request.qr_token, admin_user["id"])


@router.post("/check-out")
async def check_out(
    request: CheckOutRequest,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    退場処理
    
    - **entry_log_ids**: 退場する入場記録のIDリスト
    
    管理者権限が必要です
    """
    return await EntryService.check_out(request.entry_log_ids, admin_user["id"])


@router.get("/current-visitors", response_model=CurrentVisitorsResponse)
async def get_current_visitors():
    """
    現在の利用者一覧を取得
    
    認証不要
    """
    return await EntryService.get_current_visitors()


@router.get("/history", response_model=List[EntryLogResponse])
async def get_entry_history(
    user_id: Optional[str] = Query(None, description="ユーザーIDでフィルタ"),
    start_date: Optional[date] = Query(None, description="開始日"),
    end_date: Optional[date] = Query(None, description="終了日"),
    limit: int = Query(50, le=200, description="取得件数"),
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    入退場履歴を取得（管理者用）
    
    - **user_id**: ユーザーIDでフィルタ（オプション）
    - **start_date**: 開始日でフィルタ（オプション）
    - **end_date**: 終了日でフィルタ（オプション）
    - **limit**: 取得件数（最大200）
    
    管理者権限が必要です
    """
    return await EntryService.get_entry_history(user_id, start_date, end_date, limit)


@router.get("/my-history", response_model=List[EntryLogResponse])
async def get_my_entry_history(
    start_date: Optional[date] = Query(None, description="開始日"),
    end_date: Optional[date] = Query(None, description="終了日"),
    limit: int = Query(50, le=100, description="取得件数"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    自分の入退場履歴を取得
    
    - **start_date**: 開始日でフィルタ（オプション）
    - **end_date**: 終了日でフィルタ（オプション）
    - **limit**: 取得件数（最大100）
    
    認証が必要です
    """
    return await EntryService.get_entry_history(current_user["id"], start_date, end_date, limit)


@router.get("/statistics", response_model=VisitorStatistics)
async def get_visitor_statistics(
    target_date: Optional[date] = Query(None, description="対象日（デフォルト: 今日）")
):
    """
    利用統計を取得
    
    - **target_date**: 対象日（指定しない場合は今日）
    
    認証不要
    """
    return await EntryService.get_visitor_statistics(target_date)