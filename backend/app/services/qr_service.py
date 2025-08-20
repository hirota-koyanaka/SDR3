import qrcode
import io
import base64
from datetime import datetime, timedelta
import jwt
from typing import List, Dict, Any
from app.core.config import settings
from fastapi import HTTPException, status


class QRService:
    @staticmethod
    async def generate_entry_qr(user_id: str, dog_ids: List[str]) -> Dict[str, Any]:
        """
        入場用QRコードを生成
        """
        try:
            # 有効期限付きトークンの生成（24時間有効）
            expires_at = datetime.utcnow() + timedelta(hours=24)
            payload = {
                "user_id": user_id,
                "dog_ids": dog_ids,
                "exp": expires_at,
                "type": "entry"
            }
            
            # JWTトークンを生成
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
            
            # QRコードの生成
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(token)
            qr.make(fit=True)
            
            # 画像を生成
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Base64エンコード
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "qr_code": f"data:image/png;base64,{img_str}",
                "token": token,
                "expires_at": expires_at.isoformat()
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"QRコード生成エラー: {str(e)}"
            )
    
    @staticmethod
    def verify_qr_token(token: str) -> Dict[str, Any]:
        """
        QRコードトークンを検証
        """
        try:
            # トークンをデコード
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            
            # タイプが入場用であることを確認
            if payload.get("type") != "entry":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="無効なQRコードです"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QRコードの有効期限が切れています"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="無効なQRコードです"
            )