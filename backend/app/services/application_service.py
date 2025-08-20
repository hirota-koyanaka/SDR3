from app.core.supabase import supabase
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationStatus
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid


class ApplicationService:
    @staticmethod
    async def create_application(data: ApplicationCreate) -> Dict[str, Any]:
        """
        利用申請を作成
        """
        try:
            # 申請データの作成
            application = {
                "email": data.email,
                "name": data.name,
                "phone": data.phone,
                "address": data.address,
                "is_imabari_resident": data.is_imabari_resident,
                "residence_years": data.residence_years,
                "preferred_date": data.preferred_date.isoformat() if data.preferred_date else None,
                "status": ApplicationStatus.PENDING.value
            }
            
            # 申請をデータベースに保存
            result = supabase.table("applications").insert(application).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="申請の作成に失敗しました"
                )
            
            application_id = result.data[0]["id"]
            
            # 犬情報を別途保存する場合の処理（後で実装）
            # for dog in data.dog_info:
            #     dog_data = {
            #         "application_id": application_id,
            #         **dog.dict()
            #     }
            #     supabase.table("application_dogs").insert(dog_data).execute()
            
            # TODO: 管理者への通知機能を実装
            # await NotificationService.notify_admin_new_application(result.data[0])
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"申請作成エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_application(application_id: str) -> Dict[str, Any]:
        """
        申請詳細を取得
        """
        try:
            result = supabase.table("applications").select("*").eq("id", application_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="申請が見つかりません"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"申請取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def check_application_status(email: str) -> List[Dict[str, Any]]:
        """
        メールアドレスで申請状況を確認
        """
        try:
            result = supabase.table("applications").select("*").eq("email", email).order("created_at", desc=True).execute()
            return result.data or []
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"申請状況確認エラー: {str(e)}"
            )
    
    @staticmethod
    async def list_applications(
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        申請一覧を取得（管理者用）
        """
        try:
            # クエリの構築
            query = supabase.table("applications").select("*", count="exact")
            
            if status:
                query = query.eq("status", status)
            
            # ページネーション
            result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return {
                "total": result.count if hasattr(result, 'count') else len(result.data),
                "items": result.data or [],
                "page": offset // limit + 1,
                "per_page": limit
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"申請一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def approve_application(
        application_id: str,
        admin_id: str,
        admin_memo: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        申請を承認
        """
        try:
            # 申請情報を取得
            application = await ApplicationService.get_application(application_id)
            
            if application["status"] != ApplicationStatus.PENDING.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="この申請は既に処理されています"
                )
            
            # 申請ステータスを更新
            update_data = {
                "status": ApplicationStatus.APPROVED.value,
                "admin_memo": admin_memo,
                "reviewed_at": datetime.utcnow().isoformat(),
                "reviewed_by": admin_id
            }
            
            result = supabase.table("applications").update(update_data).eq("id", application_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="申請の承認に失敗しました"
                )
            
            # ユーザーアカウントの作成処理
            # TODO: Supabase Authでユーザーを作成し、usersテーブルに登録
            
            # TODO: 承認メール送信
            # await NotificationService.send_approval_email(application)
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"申請承認エラー: {str(e)}"
            )
    
    @staticmethod
    async def reject_application(
        application_id: str,
        admin_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        申請を却下
        """
        try:
            # 申請情報を取得
            application = await ApplicationService.get_application(application_id)
            
            if application["status"] != ApplicationStatus.PENDING.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="この申請は既に処理されています"
                )
            
            # 申請ステータスを更新
            update_data = {
                "status": ApplicationStatus.REJECTED.value,
                "rejected_reason": reason,
                "reviewed_at": datetime.utcnow().isoformat(),
                "reviewed_by": admin_id
            }
            
            result = supabase.table("applications").update(update_data).eq("id", application_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="申請の却下に失敗しました"
                )
            
            # TODO: 却下メール送信
            # await NotificationService.send_rejection_email(application, reason)
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"申請却下エラー: {str(e)}"
            )