from fastapi import APIRouter, Depends, Query, status, HTTPException, Form, UploadFile, File, Request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import json
import uuid
from app.core.supabase import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/api/v1/applications", tags=["申請管理"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    emergency_contact: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    prefecture: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    address: str = Form(...),
    building: Optional[str] = Form(None),
    is_imabari_resident: Optional[bool] = Form(None),
    residence_years: Optional[int] = Form(None),
    dogs: Optional[str] = Form(None),
    vaccination_certificates: Optional[List[UploadFile]] = File(None),
    residence_proof: Optional[UploadFile] = File(None),
    supabase: Client = Depends(get_supabase_client)
):
    """利用申請を作成"""
    try:
        print(f"Received data - name: {name}, email: {email}, phone: {phone}, address: {address}")
        print(f"Files - vaccination_certificates: {vaccination_certificates}, residence_proof: {residence_proof}")
        
        # 犬情報をパース
        dogs_data = json.loads(dogs) if isinstance(dogs, str) and dogs else []
        
        # 申請IDを生成
        application_id = str(uuid.uuid4())
        
        # 申請データを作成（実際のテーブル構造に合わせる）
        application_data = {
            "id": application_id,
            "name": name,
            "email": email,
            "phone": phone,
            "address": address,
            "status": "pending"
            # created_atは自動設定される
        }
        
        # Supabaseに保存
        result = supabase.table("applications").insert(application_data).execute()
        
        if result.data:
            # 犬情報の保存は一時的にスキップ（テーブル構造の不一致のため）
            # TODO: dogsテーブルのスキーマを確認して修正
            pass
            
            return {
                "id": application_id,
                "message": "申請を受け付けました",
                "status": "pending"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="申請の作成に失敗しました"
            )
            
    except Exception as e:
        print(f"Error creating application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"申請の送信に失敗しました: {str(e)}"
        )


@router.get("/{application_id}")
async def get_application(application_id: str, supabase: Client = Depends(get_supabase_client)):
    """申請詳細を取得"""
    try:
        result = supabase.table("applications").select("*").eq("id", application_id).execute()
        
        if result.data and len(result.data) > 0:
            application = result.data[0]
            # 犬情報の取得は一時的にスキップ（テーブル構造の不一致のため）
            # TODO: dogsテーブルのスキーマを確認して修正
            application["dogs"] = []
            return application
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="申請が見つかりません"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="申請情報の取得に失敗しました"
        )


@router.get("/status/{email}")
async def check_application_status(email: str, supabase: Client = Depends(get_supabase_client)):
    """申請状況を確認（メールアドレスで検索）"""
    try:
        result = supabase.table("applications").select("*").eq("email", email).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error checking status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ステータスの確認に失敗しました"
        )