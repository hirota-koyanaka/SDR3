from app.core.supabase import supabase
from fastapi import HTTPException, UploadFile, status
from typing import Dict, Any, List
import uuid
import os
from datetime import datetime


class FileService:
    # 許可されるファイルタイプ
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    ALLOWED_DOCUMENT_TYPES = ["application/pdf"]
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    @staticmethod
    async def upload_vaccination_certificate(
        file: UploadFile,
        user_id: str
    ) -> Dict[str, Any]:
        """
        ワクチン証明書をアップロード
        """
        try:
            # ファイルサイズチェック
            contents = await file.read()
            if len(contents) > FileService.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ファイルサイズは5MB以下にしてください"
                )
            
            # ファイルタイプチェック
            allowed_types = FileService.ALLOWED_IMAGE_TYPES + FileService.ALLOWED_DOCUMENT_TYPES
            if file.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JPG、PNG、PDFファイルのみ許可されています"
                )
            
            # ファイル名の生成
            file_extension = os.path.splitext(file.filename)[1]
            file_name = f"vaccination/{user_id}/{uuid.uuid4()}{file_extension}"
            
            # Supabase Storageにアップロード
            response = supabase.storage.from_("documents").upload(
                file_name,
                contents,
                {"content-type": file.content_type}
            )
            
            # Public URLを取得
            public_url = supabase.storage.from_("documents").get_public_url(file_name)
            
            return {
                "url": public_url,
                "file_name": file_name,
                "content_type": file.content_type,
                "size": len(contents)
            }
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ファイルアップロードエラー: {str(e)}"
            )
    
    @staticmethod
    async def upload_dog_photo(
        file: UploadFile,
        user_id: str,
        dog_id: str
    ) -> Dict[str, Any]:
        """
        犬の写真をアップロード
        """
        try:
            # ファイルサイズチェック
            contents = await file.read()
            if len(contents) > FileService.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ファイルサイズは5MB以下にしてください"
                )
            
            # ファイルタイプチェック
            if file.content_type not in FileService.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JPG、PNG、GIF、WebP形式の画像のみ許可されています"
                )
            
            # ファイル名の生成
            file_extension = os.path.splitext(file.filename)[1]
            file_name = f"dogs/{user_id}/{dog_id}/{uuid.uuid4()}{file_extension}"
            
            # Supabase Storageにアップロード
            response = supabase.storage.from_("images").upload(
                file_name,
                contents,
                {"content-type": file.content_type}
            )
            
            # Public URLを取得
            public_url = supabase.storage.from_("images").get_public_url(file_name)
            
            # 犬情報を更新
            supabase.table("dogs").update(
                {"photo_url": public_url}
            ).eq("id", dog_id).eq("user_id", user_id).execute()
            
            return {
                "url": public_url,
                "file_name": file_name,
                "content_type": file.content_type,
                "size": len(contents)
            }
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"写真アップロードエラー: {str(e)}"
            )
    
    @staticmethod
    async def upload_post_images(
        files: List[UploadFile],
        user_id: str,
        post_id: str
    ) -> List[Dict[str, Any]]:
        """
        投稿用画像を複数アップロード
        """
        try:
            uploaded_images = []
            
            # 最大5枚まで
            if len(files) > 5:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="画像は最大5枚までアップロード可能です"
                )
            
            for index, file in enumerate(files):
                # ファイルサイズチェック
                contents = await file.read()
                if len(contents) > FileService.MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"{file.filename}: ファイルサイズは5MB以下にしてください"
                    )
                
                # ファイルタイプチェック
                if file.content_type not in FileService.ALLOWED_IMAGE_TYPES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"{file.filename}: 画像ファイルのみ許可されています"
                    )
                
                # ファイル名の生成
                file_extension = os.path.splitext(file.filename)[1]
                file_name = f"posts/{user_id}/{post_id}/{uuid.uuid4()}{file_extension}"
                
                # Supabase Storageにアップロード
                response = supabase.storage.from_("images").upload(
                    file_name,
                    contents,
                    {"content-type": file.content_type}
                )
                
                # Public URLを取得
                public_url = supabase.storage.from_("images").get_public_url(file_name)
                
                # post_imagesテーブルに保存
                image_record = {
                    "post_id": post_id,
                    "image_url": public_url,
                    "display_order": index
                }
                supabase.table("post_images").insert(image_record).execute()
                
                uploaded_images.append({
                    "url": public_url,
                    "file_name": file_name,
                    "display_order": index
                })
            
            return uploaded_images
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"画像アップロードエラー: {str(e)}"
            )
    
    @staticmethod
    async def upload_avatar(
        file: UploadFile,
        user_id: str
    ) -> Dict[str, Any]:
        """
        ユーザーアバター画像をアップロード
        """
        try:
            # ファイルサイズチェック
            contents = await file.read()
            if len(contents) > FileService.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ファイルサイズは5MB以下にしてください"
                )
            
            # ファイルタイプチェック
            if file.content_type not in FileService.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="画像ファイルのみ許可されています"
                )
            
            # ファイル名の生成
            file_extension = os.path.splitext(file.filename)[1]
            file_name = f"avatars/{user_id}/{uuid.uuid4()}{file_extension}"
            
            # Supabase Storageにアップロード
            response = supabase.storage.from_("images").upload(
                file_name,
                contents,
                {"content-type": file.content_type}
            )
            
            # Public URLを取得
            public_url = supabase.storage.from_("images").get_public_url(file_name)
            
            # ユーザー情報を更新
            supabase.table("users").update(
                {"avatar_url": public_url}
            ).eq("id", user_id).execute()
            
            return {
                "url": public_url,
                "file_name": file_name,
                "content_type": file.content_type,
                "size": len(contents)
            }
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"アバターアップロードエラー: {str(e)}"
            )
    
    @staticmethod
    async def delete_file(bucket: str, file_path: str) -> Dict[str, str]:
        """
        ファイルを削除
        """
        try:
            # Supabase Storageから削除
            response = supabase.storage.from_(bucket).remove([file_path])
            
            return {"message": "ファイルを削除しました"}
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ファイル削除エラー: {str(e)}"
            )