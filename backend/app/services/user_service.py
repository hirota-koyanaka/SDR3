from app.core.supabase import supabase
from app.schemas.user import UserProfileUpdate, UserStatusUpdate
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional


class UserService:
    @staticmethod
    async def get_profile(user_id: str) -> Dict[str, Any]:
        """
        ユーザープロフィールを取得
        """
        try:
            # ユーザー情報と犬情報を結合して取得
            result = supabase.table("users").select(
                "*, dogs(*)"
            ).eq("id", user_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="ユーザーが見つかりません"
                )
            
            # アクティブな犬のみフィルタリング
            user_data = result.data[0]
            if user_data.get("dogs"):
                user_data["dogs"] = [dog for dog in user_data["dogs"] if dog.get("is_active", True)]
            
            return user_data
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"プロフィール取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_profile(user_id: str, profile_data: UserProfileUpdate) -> Dict[str, Any]:
        """
        ユーザープロフィールを更新
        """
        try:
            # 更新データの準備（Noneの値を除外）
            update_data = profile_data.dict(exclude_none=True)
            
            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="更新するデータがありません"
                )
            
            result = supabase.table("users").update(update_data).eq("id", user_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="プロフィールの更新に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"プロフィール更新エラー: {str(e)}"
            )
    
    @staticmethod
    async def list_users(
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        ユーザー一覧を取得（管理者用）
        """
        try:
            # クエリの構築
            query = supabase.table("users").select("*, dogs(*)", count="exact")
            
            if status:
                query = query.eq("status", status)
            
            # ページネーション
            result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            # 各ユーザーのアクティブな犬のみフィルタリング
            if result.data:
                for user in result.data:
                    if user.get("dogs"):
                        user["dogs"] = [dog for dog in user["dogs"] if dog.get("is_active", True)]
            
            return {
                "total": result.count if hasattr(result, 'count') else len(result.data),
                "items": result.data or [],
                "page": offset // limit + 1,
                "per_page": limit
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ユーザー一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Dict[str, Any]:
        """
        特定のユーザー情報を取得（管理者用）
        """
        try:
            result = supabase.table("users").select(
                "*, dogs(*, vaccination_records(*))"
            ).eq("id", user_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="ユーザーが見つかりません"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ユーザー情報取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_user_status(user_id: str, status_data: UserStatusUpdate) -> Dict[str, Any]:
        """
        ユーザーステータスを更新（管理者用）
        """
        try:
            # ステータスの検証
            valid_statuses = ["pending", "active", "suspended"]
            if status_data.status not in valid_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"無効なステータス: {status_data.status}"
                )
            
            result = supabase.table("users").update(
                {"status": status_data.status}
            ).eq("id", user_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="ステータスの更新に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ステータス更新エラー: {str(e)}"
            )
    
    @staticmethod
    async def search_users(query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        ユーザーを検索（管理者用）
        """
        try:
            # 名前、メールアドレス、電話番号で検索
            result = supabase.table("users").select("*").or_(
                f"name.ilike.%{query}%,email.ilike.%{query}%,phone.ilike.%{query}%"
            ).limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ユーザー検索エラー: {str(e)}"
            )