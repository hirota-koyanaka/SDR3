from app.core.supabase import supabase
from app.schemas.event import EventCreate, EventUpdate, EventRegistrationStatus
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime, date


class EventService:
    @staticmethod
    async def create_event(event_data: EventCreate, admin_id: str) -> Dict[str, Any]:
        """
        イベントを作成（管理者用）
        """
        try:
            event = {
                **event_data.dict(exclude_none=True),
                "created_by": admin_id
            }
            
            # 日時をISO形式に変換
            if event.get("event_date"):
                event["event_date"] = event["event_date"].isoformat()
            if event.get("registration_deadline"):
                event["registration_deadline"] = event["registration_deadline"].isoformat()
            
            result = supabase.table("events").insert(event).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="イベントの作成に失敗しました"
                )
            
            # TODO: 全ユーザーへの通知
            # await NotificationService.notify_new_event(result.data[0])
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"イベント作成エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_events(
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 20,
        offset: int = 0,
        current_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        イベント一覧を取得
        """
        try:
            # 基本クエリ
            query = supabase.table("events").select("*", count="exact")
            
            # 日付フィルタ
            if start_date:
                query = query.gte("event_date", start_date.isoformat())
            if end_date:
                query = query.lte("event_date", end_date.isoformat())
            
            # ページネーションと並び順
            result = query.order("event_date").range(offset, offset + limit - 1).execute()
            
            events = result.data or []
            
            # 各イベントに参加者数と登録状態を追加
            for event in events:
                event_id = event["id"]
                
                # 参加登録者数
                registrations = supabase.table("event_registrations").select(
                    "id", count="exact"
                ).eq("event_id", event_id).eq("status", EventRegistrationStatus.REGISTERED.value).execute()
                event["registration_count"] = registrations.count if hasattr(registrations, 'count') else 0
                
                # 現在のユーザーが登録しているか
                if current_user_id:
                    user_registration = supabase.table("event_registrations").select("status").eq(
                        "event_id", event_id
                    ).eq("user_id", current_user_id).execute()
                    
                    event["is_registered"] = (
                        len(user_registration.data) > 0 and 
                        user_registration.data[0]["status"] == EventRegistrationStatus.REGISTERED.value
                    )
                else:
                    event["is_registered"] = False
                
                # 登録可能かチェック
                now = datetime.utcnow()
                event["can_register"] = True
                
                # 定員チェック
                if event.get("max_participants"):
                    if event["registration_count"] >= event["max_participants"]:
                        event["can_register"] = False
                
                # 締切チェック
                if event.get("registration_deadline"):
                    deadline = datetime.fromisoformat(event["registration_deadline"].replace('Z', '+00:00'))
                    if now > deadline:
                        event["can_register"] = False
                
                # イベント日チェック
                event_date = datetime.fromisoformat(event["event_date"].replace('Z', '+00:00'))
                if now > event_date:
                    event["can_register"] = False
            
            return {
                "total": result.count if hasattr(result, 'count') else len(events),
                "items": events,
                "page": offset // limit + 1,
                "per_page": limit
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"イベント一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_event(event_id: str, current_user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        イベント詳細を取得
        """
        try:
            result = supabase.table("events").select("*").eq("id", event_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="イベントが見つかりません"
                )
            
            event = result.data[0]
            
            # 参加登録者数
            registrations = supabase.table("event_registrations").select(
                "id", count="exact"
            ).eq("event_id", event_id).eq("status", EventRegistrationStatus.REGISTERED.value).execute()
            event["registration_count"] = registrations.count if hasattr(registrations, 'count') else 0
            
            # 現在のユーザーが登録しているか
            if current_user_id:
                user_registration = supabase.table("event_registrations").select("status").eq(
                    "event_id", event_id
                ).eq("user_id", current_user_id).execute()
                
                event["is_registered"] = (
                    len(user_registration.data) > 0 and 
                    user_registration.data[0]["status"] == EventRegistrationStatus.REGISTERED.value
                )
            else:
                event["is_registered"] = False
            
            # 登録可能かチェック
            now = datetime.utcnow()
            event["can_register"] = True
            
            # 定員チェック
            if event.get("max_participants"):
                if event["registration_count"] >= event["max_participants"]:
                    event["can_register"] = False
            
            # 締切チェック
            if event.get("registration_deadline"):
                deadline = datetime.fromisoformat(event["registration_deadline"].replace('Z', '+00:00'))
                if now > deadline:
                    event["can_register"] = False
            
            # イベント日チェック
            event_date = datetime.fromisoformat(event["event_date"].replace('Z', '+00:00'))
            if now > event_date:
                event["can_register"] = False
            
            return event
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"イベント詳細取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def register_event(event_id: str, user_id: str) -> Dict[str, Any]:
        """
        イベントに参加登録
        """
        try:
            # イベント情報を取得
            event = await EventService.get_event(event_id, user_id)
            
            # 既に登録済みかチェック
            if event["is_registered"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="既に登録済みです"
                )
            
            # 登録可能かチェック
            if not event["can_register"]:
                if event.get("max_participants") and event["registration_count"] >= event["max_participants"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="定員に達しています"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="登録期限を過ぎています"
                    )
            
            # 参加登録
            registration = {
                "event_id": event_id,
                "user_id": user_id,
                "status": EventRegistrationStatus.REGISTERED.value
            }
            
            result = supabase.table("event_registrations").insert(registration).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="参加登録に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"参加登録エラー: {str(e)}"
            )
    
    @staticmethod
    async def cancel_registration(event_id: str, user_id: str) -> Dict[str, str]:
        """
        イベント参加をキャンセル
        """
        try:
            # 登録を確認
            registration = supabase.table("event_registrations").select("*").eq(
                "event_id", event_id
            ).eq("user_id", user_id).eq("status", EventRegistrationStatus.REGISTERED.value).execute()
            
            if not registration.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="参加登録が見つかりません"
                )
            
            # ステータスをキャンセルに更新
            update_data = {
                "status": EventRegistrationStatus.CANCELLED.value,
                "cancelled_at": datetime.utcnow().isoformat()
            }
            
            result = supabase.table("event_registrations").update(update_data).eq(
                "id", registration.data[0]["id"]
            ).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="キャンセルに失敗しました"
                )
            
            return {"message": "参加登録をキャンセルしました"}
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"キャンセルエラー: {str(e)}"
            )
    
    @staticmethod
    async def get_event_registrations(event_id: str) -> List[Dict[str, Any]]:
        """
        イベントの参加者一覧を取得（管理者用）
        """
        try:
            result = supabase.table("event_registrations").select(
                "*, users!inner(name, email, phone)"
            ).eq("event_id", event_id).eq("status", EventRegistrationStatus.REGISTERED.value).execute()
            
            registrations = result.data or []
            
            # データの整形
            for reg in registrations:
                if reg.get("users"):
                    reg["user_name"] = reg["users"]["name"]
                    reg["user_email"] = reg["users"]["email"]
                    reg["user_phone"] = reg["users"]["phone"]
            
            return registrations
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"参加者一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_event(event_id: str, event_data: EventUpdate) -> Dict[str, Any]:
        """
        イベントを更新（管理者用）
        """
        try:
            # イベントの存在確認
            existing = supabase.table("events").select("id").eq("id", event_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="イベントが見つかりません"
                )
            
            # 更新データの準備
            update_data = event_data.dict(exclude_none=True)
            
            # 日時をISO形式に変換
            if update_data.get("event_date"):
                update_data["event_date"] = update_data["event_date"].isoformat()
            if update_data.get("registration_deadline"):
                update_data["registration_deadline"] = update_data["registration_deadline"].isoformat()
            
            result = supabase.table("events").update(update_data).eq("id", event_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="イベントの更新に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"イベント更新エラー: {str(e)}"
            )