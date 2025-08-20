from app.core.supabase import supabase
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementPriority,
    BusinessHours,
    SpecialHoliday
)
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime, date


class AnnouncementService:
    @staticmethod
    async def create_announcement(
        announcement_data: AnnouncementCreate,
        admin_id: str
    ) -> Dict[str, Any]:
        """
        お知らせを作成
        """
        try:
            announcement = {
                **announcement_data.dict(),
                "created_by": admin_id
            }
            
            result = supabase.table("announcements").insert(announcement).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="お知らせの作成に失敗しました"
                )
            
            # 優先度がhigh以上の場合はプッシュ通知を送信
            if announcement_data.priority in [AnnouncementPriority.HIGH, AnnouncementPriority.URGENT]:
                # TODO: プッシュ通知実装
                # await NotificationService.send_push_notification(result.data[0])
                pass
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"お知らせ作成エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_announcements(
        is_active_only: bool = True,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        お知らせ一覧を取得
        """
        try:
            query = supabase.table("announcements").select("*", count="exact")
            
            if is_active_only:
                query = query.eq("is_active", True)
            
            # 優先度と作成日時でソート
            result = query.order("priority", desc=True).order("created_at", desc=True).range(
                offset, offset + limit - 1
            ).execute()
            
            return {
                "total": result.count if hasattr(result, 'count') else len(result.data),
                "items": result.data or [],
                "page": offset // limit + 1,
                "per_page": limit
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"お知らせ一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_announcement(announcement_id: str) -> Dict[str, Any]:
        """
        お知らせ詳細を取得
        """
        try:
            result = supabase.table("announcements").select("*").eq("id", announcement_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="お知らせが見つかりません"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"お知らせ取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_announcement(
        announcement_id: str,
        announcement_data: AnnouncementUpdate
    ) -> Dict[str, Any]:
        """
        お知らせを更新
        """
        try:
            # お知らせの存在確認
            existing = supabase.table("announcements").select("id").eq("id", announcement_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="お知らせが見つかりません"
                )
            
            # 更新データの準備
            update_data = announcement_data.dict(exclude_none=True)
            
            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="更新するデータがありません"
                )
            
            result = supabase.table("announcements").update(update_data).eq("id", announcement_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="お知らせの更新に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"お知らせ更新エラー: {str(e)}"
            )
    
    @staticmethod
    async def delete_announcement(announcement_id: str) -> Dict[str, str]:
        """
        お知らせを削除（論理削除）
        """
        try:
            # お知らせの存在確認
            existing = supabase.table("announcements").select("id").eq("id", announcement_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="お知らせが見つかりません"
                )
            
            # is_activeをfalseに設定（論理削除）
            result = supabase.table("announcements").update({"is_active": False}).eq("id", announcement_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="お知らせの削除に失敗しました"
                )
            
            return {"message": "お知らせを削除しました"}
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"お知らせ削除エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_business_hours() -> List[Dict[str, Any]]:
        """
        営業時間を取得
        """
        try:
            result = supabase.table("business_hours").select("*").order("day_of_week").execute()
            
            # データが存在しない場合はデフォルト値を返す
            if not result.data:
                default_hours = []
                for day in range(7):
                    default_hours.append({
                        "day_of_week": day,
                        "open_time": "09:00" if day != 0 else "10:00",  # 日曜日は10時開園
                        "close_time": "17:00",
                        "is_closed": False
                    })
                return default_hours
            
            return result.data
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"営業時間取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_business_hours(hours_data: List[BusinessHours]) -> Dict[str, Any]:
        """
        営業時間を更新
        """
        try:
            updated_count = 0
            
            for hours in hours_data:
                # upsertで更新または作成
                result = supabase.table("business_hours").upsert({
                    "day_of_week": hours.day_of_week,
                    "open_time": hours.open_time,
                    "close_time": hours.close_time,
                    "is_closed": hours.is_closed
                }).execute()
                
                if result.data:
                    updated_count += 1
            
            return {
                "message": f"{updated_count}件の営業時間を更新しました",
                "updated_count": updated_count
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"営業時間更新エラー: {str(e)}"
            )
    
    @staticmethod
    async def add_special_holiday(holiday_data: SpecialHoliday) -> Dict[str, Any]:
        """
        特別休業日を追加
        """
        try:
            # 日付の重複チェック
            existing = supabase.table("special_holidays").select("id").eq(
                "holiday_date", holiday_data.holiday_date
            ).execute()
            
            if existing.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="この日付は既に登録されています"
                )
            
            result = supabase.table("special_holidays").insert(holiday_data.dict()).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="特別休業日の追加に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"特別休業日追加エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_special_holidays(
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        特別休業日一覧を取得
        """
        try:
            query = supabase.table("special_holidays").select("*")
            
            if start_date:
                query = query.gte("holiday_date", start_date.isoformat())
            
            if end_date:
                query = query.lte("holiday_date", end_date.isoformat())
            
            result = query.order("holiday_date").execute()
            
            return result.data or []
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"特別休業日取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def delete_special_holiday(holiday_id: str) -> Dict[str, str]:
        """
        特別休業日を削除
        """
        try:
            # 存在確認
            existing = supabase.table("special_holidays").select("id").eq("id", holiday_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="特別休業日が見つかりません"
                )
            
            # 削除
            supabase.table("special_holidays").delete().eq("id", holiday_id).execute()
            
            return {"message": "特別休業日を削除しました"}
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"特別休業日削除エラー: {str(e)}"
            )