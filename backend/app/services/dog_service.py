from app.core.supabase import supabase
from app.schemas.dog import DogCreate, DogUpdate, VaccinationRecordCreate
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime


class DogService:
    @staticmethod
    async def create_dog(dog_data: DogCreate, user_id: str) -> Dict[str, Any]:
        """
        犬情報を登録
        """
        try:
            dog = {
                **dog_data.dict(exclude_none=True),
                "user_id": user_id
            }
            
            # 生年月日をISO形式に変換
            if dog.get("birth_date"):
                dog["birth_date"] = dog["birth_date"].isoformat()
            
            result = supabase.table("dogs").insert(dog).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="犬情報の登録に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"犬情報登録エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_user_dogs(user_id: str) -> List[Dict[str, Any]]:
        """
        ユーザーの犬一覧を取得
        """
        try:
            # 犬情報とワクチン接種記録を結合して取得
            result = supabase.table("dogs").select(
                "*, vaccination_records(*)"
            ).eq("user_id", user_id).eq("is_active", True).execute()
            
            return result.data or []
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"犬情報取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_dog_by_id(dog_id: str, user_id: str) -> Dict[str, Any]:
        """
        特定の犬情報を取得
        """
        try:
            result = supabase.table("dogs").select(
                "*, vaccination_records(*)"
            ).eq("id", dog_id).eq("user_id", user_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="犬情報が見つかりません"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"犬情報取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def update_dog(dog_id: str, dog_data: DogUpdate, user_id: str) -> Dict[str, Any]:
        """
        犬情報を更新
        """
        try:
            # 所有者確認
            existing = supabase.table("dogs").select("id").eq("id", dog_id).eq("user_id", user_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="この犬情報を更新する権限がありません"
                )
            
            # 更新データの準備
            update_data = dog_data.dict(exclude_none=True)
            if update_data.get("birth_date"):
                update_data["birth_date"] = update_data["birth_date"].isoformat()
            
            result = supabase.table("dogs").update(update_data).eq("id", dog_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="犬情報の更新に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"犬情報更新エラー: {str(e)}"
            )
    
    @staticmethod
    async def delete_dog(dog_id: str, user_id: str) -> Dict[str, str]:
        """
        犬情報を削除（論理削除）
        """
        try:
            # 所有者確認
            existing = supabase.table("dogs").select("id").eq("id", dog_id).eq("user_id", user_id).execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="この犬情報を削除する権限がありません"
                )
            
            # 論理削除（is_activeをfalseに設定）
            result = supabase.table("dogs").update({"is_active": False}).eq("id", dog_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="犬情報の削除に失敗しました"
                )
            
            return {"message": "犬情報を削除しました"}
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"犬情報削除エラー: {str(e)}"
            )
    
    @staticmethod
    async def add_vaccination_record(
        dog_id: str,
        record: VaccinationRecordCreate,
        user_id: str
    ) -> Dict[str, Any]:
        """
        ワクチン接種記録を追加
        """
        try:
            # 犬の所有者確認
            dog = supabase.table("dogs").select("id").eq("id", dog_id).eq("user_id", user_id).execute()
            
            if not dog.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="このワクチン記録を追加する権限がありません"
                )
            
            # ワクチン記録データの準備
            vaccination = {
                **record.dict(exclude_none=True),
                "dog_id": dog_id
            }
            
            # 日付をISO形式に変換
            if vaccination.get("vaccination_date"):
                vaccination["vaccination_date"] = vaccination["vaccination_date"].isoformat()
            if vaccination.get("next_vaccination_date"):
                vaccination["next_vaccination_date"] = vaccination["next_vaccination_date"].isoformat()
            
            result = supabase.table("vaccination_records").insert(vaccination).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="ワクチン記録の追加に失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ワクチン記録追加エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_vaccination_records(dog_id: str, user_id: str) -> List[Dict[str, Any]]:
        """
        犬のワクチン接種記録を取得
        """
        try:
            # 犬の所有者確認
            dog = supabase.table("dogs").select("id").eq("id", dog_id).eq("user_id", user_id).execute()
            
            if not dog.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="このワクチン記録を表示する権限がありません"
                )
            
            result = supabase.table("vaccination_records").select("*").eq("dog_id", dog_id).order("vaccination_date", desc=True).execute()
            
            return result.data or []
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ワクチン記録取得エラー: {str(e)}"
            )