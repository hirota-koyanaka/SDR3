from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional, Dict, Any
from app.schemas.user import (
    UserProfileUpdate,
    UserProfileResponse,
    UserListResponse,
    UserStatusUpdate
)
from app.services.user_service import UserService
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/users", tags=["ユーザー管理"])


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    自分のプロフィールを取得
    
    認証が必要です
    """
    return await UserService.get_profile(current_user["id"])


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    自分のプロフィールを更新
    
    - **name**: 氏名
    - **phone**: 電話番号
    - **address**: 住所
    - **is_imabari_resident**: 今治市民かどうか
    - **residence_years**: 今治市居住年数
    - **avatar_url**: アバター画像URL
    
    認証が必要です
    """
    await UserService.update_profile(current_user["id"], profile_data)
    return await UserService.get_profile(current_user["id"])


# 管理者用エンドポイント
@router.get("/admin/list", response_model=UserListResponse)
async def list_users(
    status: Optional[str] = Query(None, description="フィルタするステータス"),
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット"),
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    ユーザー一覧を取得（管理者用）
    
    - **status**: フィルタするステータス (pending/active/suspended)
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    
    管理者権限が必要です
    """
    return await UserService.list_users(status, limit, offset)


@router.get("/admin/{user_id}", response_model=UserProfileResponse)
async def get_user(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    特定のユーザー情報を取得（管理者用）
    
    - **user_id**: ユーザーID
    
    管理者権限が必要です
    """
    return await UserService.get_user_by_id(user_id)


@router.put("/admin/{user_id}/status", response_model=UserProfileResponse)
async def update_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    ユーザーステータスを更新（管理者用）
    
    - **user_id**: ユーザーID
    - **status**: 新しいステータス (pending/active/suspended)
    
    管理者権限が必要です
    """
    await UserService.update_user_status(user_id, status_data)
    return await UserService.get_user_by_id(user_id)


@router.get("/admin/search", response_model=List[UserProfileResponse])
async def search_users(
    q: str = Query(..., min_length=1, description="検索クエリ"),
    limit: int = Query(20, le=100, description="取得件数"),
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    ユーザーを検索（管理者用）
    
    - **q**: 検索クエリ（名前、メールアドレス、電話番号）
    - **limit**: 取得件数（最大100）
    
    管理者権限が必要です
    """
    return await UserService.search_users(q, limit)