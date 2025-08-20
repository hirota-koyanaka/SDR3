from app.core.supabase import supabase
from app.services.qr_service import QRService
from app.schemas.entry import QRCodeRequest, CheckInRequest, CheckOutRequest
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta


class EntryService:
    @staticmethod
    async def generate_qr_code(user_id: str, dog_ids: List[str]) -> Dict[str, Any]:
        """
        入場用QRコードを生成
        """
        try:
            # 犬の所有権を確認
            for dog_id in dog_ids:
                dog = supabase.table("dogs").select("id").eq("id", dog_id).eq("user_id", user_id).execute()
                if not dog.data:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"犬ID {dog_id} にアクセスする権限がありません"
                    )
            
            # QRコードを生成
            return await QRService.generate_entry_qr(user_id, dog_ids)
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"QRコード生成エラー: {str(e)}"
            )
    
    @staticmethod
    async def check_in(qr_token: str, admin_id: str) -> Dict[str, Any]:
        """
        入場処理（管理者がQRスキャン）
        """
        try:
            # トークンを検証
            payload = QRService.verify_qr_token(qr_token)
            user_id = payload["user_id"]
            dog_ids = payload["dog_ids"]
            
            # 既に入場済みでないか確認
            for dog_id in dog_ids:
                existing = supabase.table("entry_logs").select("id").eq(
                    "dog_id", dog_id
                ).is_("exit_time", None).execute()
                
                if existing.data:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"犬ID {dog_id} は既に入場済みです"
                    )
            
            # 入場記録を作成
            entry_logs = []
            for dog_id in dog_ids:
                entry = {
                    "user_id": user_id,
                    "dog_id": dog_id,
                    "entry_time": datetime.utcnow().isoformat(),
                    "checked_by": admin_id
                }
                result = supabase.table("entry_logs").insert(entry).execute()
                if result.data:
                    entry_logs.append(result.data[0])
            
            # TODO: リアルタイム通知
            # await broadcast_entry_update()
            
            return {
                "status": "success",
                "message": f"{len(entry_logs)}頭の入場処理が完了しました",
                "entry_logs": entry_logs
            }
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"入場処理エラー: {str(e)}"
            )
    
    @staticmethod
    async def check_out(entry_log_ids: List[str], admin_id: str) -> Dict[str, Any]:
        """
        退場処理
        """
        try:
            exit_time = datetime.utcnow().isoformat()
            updated_count = 0
            
            for log_id in entry_log_ids:
                # 入場記録が存在し、まだ退場していないことを確認
                existing = supabase.table("entry_logs").select("id").eq(
                    "id", log_id
                ).is_("exit_time", None).execute()
                
                if not existing.data:
                    continue
                
                # 退場時刻を記録
                result = supabase.table("entry_logs").update({
                    "exit_time": exit_time
                }).eq("id", log_id).execute()
                
                if result.data:
                    updated_count += 1
            
            if updated_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="有効な入場記録が見つかりません"
                )
            
            # TODO: リアルタイム通知
            # await broadcast_entry_update()
            
            return {
                "status": "success",
                "message": f"{updated_count}件の退場処理が完了しました"
            }
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"退場処理エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_current_visitors() -> Dict[str, Any]:
        """
        現在の利用者一覧を取得
        """
        try:
            # 退場時刻がnullの記録を取得
            result = supabase.table("entry_logs").select(
                "*, users!inner(name), dogs!inner(name, breed)"
            ).is_("exit_time", None).order("entry_time", desc=True).execute()
            
            visitors = result.data or []
            
            # データの整形
            for visitor in visitors:
                visitor["user_name"] = visitor["users"]["name"] if visitor.get("users") else None
                visitor["dog_name"] = visitor["dogs"]["name"] if visitor.get("dogs") else None
                visitor["dog_breed"] = visitor["dogs"]["breed"] if visitor.get("dogs") else None
            
            return {
                "count": len(visitors),
                "visitors": visitors
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"利用者一覧取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_entry_history(
        user_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        入退場履歴を取得
        """
        try:
            query = supabase.table("entry_logs").select(
                "*, users!inner(name), dogs!inner(name, breed)"
            )
            
            # フィルタ条件
            if user_id:
                query = query.eq("user_id", user_id)
            
            if start_date:
                query = query.gte("entry_time", start_date.isoformat())
            
            if end_date:
                # 終了日の23:59:59まで含める
                end_datetime = datetime.combine(end_date, datetime.max.time())
                query = query.lte("entry_time", end_datetime.isoformat())
            
            # 最新順で取得
            result = query.order("entry_time", desc=True).limit(limit).execute()
            
            history = result.data or []
            
            # データの整形
            for entry in history:
                entry["user_name"] = entry["users"]["name"] if entry.get("users") else None
                entry["dog_name"] = entry["dogs"]["name"] if entry.get("dogs") else None
                entry["dog_breed"] = entry["dogs"]["breed"] if entry.get("dogs") else None
                
                # 滞在時間を計算
                if entry.get("exit_time"):
                    entry_time = datetime.fromisoformat(entry["entry_time"].replace('Z', '+00:00'))
                    exit_time = datetime.fromisoformat(entry["exit_time"].replace('Z', '+00:00'))
                    duration = exit_time - entry_time
                    entry["stay_minutes"] = int(duration.total_seconds() / 60)
                else:
                    entry["stay_minutes"] = None
            
            return history
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"履歴取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_visitor_statistics(target_date: Optional[date] = None) -> Dict[str, Any]:
        """
        利用統計を取得
        """
        try:
            if not target_date:
                target_date = date.today()
            
            # 対象日の開始と終了時刻
            start_datetime = datetime.combine(target_date, datetime.min.time())
            end_datetime = datetime.combine(target_date, datetime.max.time())
            
            # 今日の総利用者数
            total_query = supabase.table("entry_logs").select("id", count="exact").gte(
                "entry_time", start_datetime.isoformat()
            ).lte("entry_time", end_datetime.isoformat())
            
            total_result = total_query.execute()
            total_today = total_result.count if hasattr(total_result, 'count') else 0
            
            # 現在の利用者数
            current_result = supabase.table("entry_logs").select("id", count="exact").is_("exit_time", None).execute()
            current_visitors = current_result.count if hasattr(current_result, 'count') else 0
            
            # 今日の入退場記録を取得して統計を計算
            logs_result = supabase.table("entry_logs").select("entry_time, exit_time").gte(
                "entry_time", start_datetime.isoformat()
            ).lte("entry_time", end_datetime.isoformat()).execute()
            
            logs = logs_result.data or []
            
            # ピーク時間帯を計算
            hour_counts = {}
            stay_times = []
            
            for log in logs:
                entry_time = datetime.fromisoformat(log["entry_time"].replace('Z', '+00:00'))
                hour = entry_time.hour
                hour_counts[hour] = hour_counts.get(hour, 0) + 1
                
                # 滞在時間を計算
                if log.get("exit_time"):
                    exit_time = datetime.fromisoformat(log["exit_time"].replace('Z', '+00:00'))
                    stay_minutes = (exit_time - entry_time).total_seconds() / 60
                    stay_times.append(stay_minutes)
            
            # ピーク時間帯
            peak_hour = None
            if hour_counts:
                peak_hour = max(hour_counts, key=hour_counts.get)
                peak_hour = f"{peak_hour:02d}:00"
            
            # 平均滞在時間
            average_stay_minutes = None
            if stay_times:
                average_stay_minutes = sum(stay_times) / len(stay_times)
            
            return {
                "total_today": total_today,
                "current_visitors": current_visitors,
                "peak_hour": peak_hour,
                "average_stay_minutes": average_stay_minutes
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"統計取得エラー: {str(e)}"
            )