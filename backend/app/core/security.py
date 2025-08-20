from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase import supabase
from app.core.config import settings
from typing import Optional, Dict, Any
import jwt
from datetime import datetime, timedelta

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    現在のユーザーを取得
    JWTトークンを検証してユーザー情報を返す
    """
    token = credentials.credentials
    try:
        # Supabaseでトークン検証
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効な認証情報です"
            )
        
        # usersテーブルからユーザー情報を取得
        user_data = supabase.table("users").select("*").eq("auth_id", user.user.id).execute()
        
        if not user_data.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ユーザー情報が見つかりません"
            )
        
        return user_data.data[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました"
        )


async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    管理者権限を要求
    現在のユーザーが管理者であることを確認
    """
    # admin_usersテーブルから管理者情報を取得
    admin = supabase.table("admin_users").select("*").eq("auth_id", current_user["auth_id"]).execute()
    
    if not admin.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です"
        )
    
    if not admin.data[0].get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者アカウントが無効化されています"
        )
    
    return admin.data[0]


async def require_super_admin(admin_user: Dict[str, Any] = Depends(require_admin)) -> Dict[str, Any]:
    """
    スーパー管理者権限を要求
    現在のユーザーがスーパー管理者であることを確認
    """
    if admin_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="スーパー管理者権限が必要です"
        )
    
    return admin_user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    アクセストークンを作成
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    トークンを検証
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="トークンの有効期限が切れています"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なトークンです"
        )