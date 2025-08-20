from fastapi import APIRouter, Depends, UploadFile, File, status
from typing import List, Dict, Any
from app.services.file_service import FileService
from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/files", tags=["ファイル管理"])


@router.post("/upload/vaccination-certificate", status_code=status.HTTP_201_CREATED)
async def upload_vaccination_certificate(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    ワクチン証明書をアップロード
    
    - 対応形式: JPG, PNG, PDF
    - 最大サイズ: 5MB
    
    認証が必要です
    """
    return await FileService.upload_vaccination_certificate(file, current_user["id"])


@router.post("/upload/dog-photo/{dog_id}", status_code=status.HTTP_201_CREATED)
async def upload_dog_photo(
    dog_id: str,
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    犬の写真をアップロード
    
    - **dog_id**: 犬ID
    - 対応形式: JPG, PNG, GIF, WebP
    - 最大サイズ: 5MB
    
    認証が必要です
    """
    return await FileService.upload_dog_photo(file, current_user["id"], dog_id)


@router.post("/upload/avatar", status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    ユーザーアバター画像をアップロード
    
    - 対応形式: JPG, PNG, GIF, WebP
    - 最大サイズ: 5MB
    
    認証が必要です
    """
    return await FileService.upload_avatar(file, current_user["id"])


@router.post("/upload/post-images/{post_id}", status_code=status.HTTP_201_CREATED)
async def upload_post_images(
    post_id: str,
    files: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    投稿用画像を複数アップロード
    
    - **post_id**: 投稿ID
    - 対応形式: JPG, PNG, GIF, WebP
    - 最大サイズ: 各5MB
    - 最大枚数: 5枚
    
    認証が必要です
    """
    return await FileService.upload_post_images(files, current_user["id"], post_id)