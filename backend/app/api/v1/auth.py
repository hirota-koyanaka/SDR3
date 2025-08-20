from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import UserCreate, UserLogin, Token, TokenRefresh, UserResponse
from app.services.auth_service import AuthService
from app.core.security import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/auth", tags=["認証"])


@router.get("/health")
async def auth_health_check():
    """認証サービスのヘルスチェック"""
    return {"status": "ok", "service": "auth"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    新規ユーザー登録
    
    - **email**: メールアドレス
    - **password**: パスワード
    - **name**: 氏名
    - **phone**: 電話番号
    - **address**: 住所
    - **is_imabari_resident**: 今治市民かどうか
    - **residence_years**: 今治市居住年数
    """
    return await AuthService.register_user(user_data)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    ユーザーログイン
    
    - **email**: メールアドレス
    - **password**: パスワード
    """
    return await AuthService.login(credentials.email, credentials.password)


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh):
    """
    トークンリフレッシュ
    
    - **refresh_token**: リフレッシュトークン
    """
    return await AuthService.refresh_token(token_data.refresh_token)


@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    ログアウト
    
    認証が必要です
    """
    return await AuthService.logout(current_user.get("auth_id"))


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    現在のユーザー情報取得
    
    認証が必要です
    """
    return current_user