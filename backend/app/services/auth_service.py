from app.core.supabase import supabase
from app.schemas.auth import UserCreate, Token
from fastapi import HTTPException, status
from typing import Dict, Any


class AuthService:
    @staticmethod
    async def register_user(user_data: UserCreate) -> Dict[str, Any]:
        """
        新規ユーザー登録
        1. Supabase Authでユーザー作成
        2. usersテーブルにユーザー情報保存
        """
        try:
            # Supabase Authでユーザー作成
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ユーザー登録に失敗しました"
                )
            
            # usersテーブルにユーザー情報保存
            user_record = {
                "auth_id": auth_response.user.id,
                "email": user_data.email,
                "name": user_data.name,
                "phone": user_data.phone,
                "address": user_data.address,
                "is_imabari_resident": user_data.is_imabari_resident,
                "residence_years": user_data.residence_years,
                "status": "pending"  # 初期状態は承認待ち
            }
            
            db_response = supabase.table("users").insert(user_record).execute()
            
            if not db_response.data:
                # Authユーザーを削除（ロールバック）
                supabase.auth.admin.delete_user(auth_response.user.id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="ユーザー情報の保存に失敗しました"
                )
            
            return db_response.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ユーザー登録エラー: {str(e)}"
            )
    
    @staticmethod
    async def login(email: str, password: str) -> Token:
        """
        ユーザーログイン
        """
        try:
            # Supabase Authでログイン
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="メールアドレスまたはパスワードが正しくありません"
                )
            
            # ユーザーのステータス確認
            user_data = supabase.table("users").select("status").eq("email", email).execute()
            
            if user_data.data and user_data.data[0]["status"] == "suspended":
                # ログアウト
                supabase.auth.sign_out()
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="アカウントが停止されています"
                )
            
            return Token(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                token_type="bearer"
            )
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="認証に失敗しました"
            )
    
    @staticmethod
    async def refresh_token(refresh_token: str) -> Token:
        """
        トークンのリフレッシュ
        """
        try:
            # Supabase Authでトークンリフレッシュ
            response = supabase.auth.refresh_session(refresh_token)
            
            if not response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="トークンのリフレッシュに失敗しました"
                )
            
            return Token(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                token_type="bearer"
            )
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="トークンのリフレッシュに失敗しました"
            )
    
    @staticmethod
    async def logout(token: str) -> Dict[str, str]:
        """
        ログアウト
        """
        try:
            # Supabase Authでログアウト
            supabase.auth.sign_out()
            return {"message": "ログアウトしました"}
            
        except Exception as e:
            # ログアウトエラーは無視してOKを返す
            return {"message": "ログアウトしました"}