from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any
from app.schemas.dog import (
    DogCreate,
    DogUpdate,
    DogResponse,
    DogListResponse,
    VaccinationRecordCreate,
    VaccinationRecordResponse
)
from app.services.dog_service import DogService
from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/dogs", tags=["犬情報管理"])


@router.post("/", response_model=DogResponse, status_code=status.HTTP_201_CREATED)
async def create_dog(
    dog_data: DogCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    犬情報を登録
    
    - **name**: 犬の名前
    - **breed**: 犬種（オプション）
    - **weight**: 体重（kg）（オプション）
    - **gender**: 性別（オプション）
    - **birth_date**: 生年月日（オプション）
    - **personality**: 性格（オプション）
    - **photo_url**: 写真URL（オプション）
    
    認証が必要です
    """
    return await DogService.create_dog(dog_data, current_user["id"])


@router.get("/my-dogs", response_model=List[DogResponse])
async def get_my_dogs(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    自分の登録犬一覧を取得
    
    認証が必要です
    """
    return await DogService.get_user_dogs(current_user["id"])


@router.get("/{dog_id}", response_model=DogResponse)
async def get_dog(
    dog_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    特定の犬情報を取得
    
    - **dog_id**: 犬ID
    
    認証が必要です
    """
    return await DogService.get_dog_by_id(dog_id, current_user["id"])


@router.put("/{dog_id}", response_model=DogResponse)
async def update_dog(
    dog_id: str,
    dog_data: DogUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    犬情報を更新
    
    - **dog_id**: 犬ID
    - **body**: 更新する犬情報
    
    認証が必要です
    """
    return await DogService.update_dog(dog_id, dog_data, current_user["id"])


@router.delete("/{dog_id}")
async def delete_dog(
    dog_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    犬情報を削除（論理削除）
    
    - **dog_id**: 犬ID
    
    認証が必要です
    """
    return await DogService.delete_dog(dog_id, current_user["id"])


@router.post("/{dog_id}/vaccination", response_model=VaccinationRecordResponse, status_code=status.HTTP_201_CREATED)
async def add_vaccination_record(
    dog_id: str,
    record: VaccinationRecordCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    ワクチン接種記録を追加
    
    - **dog_id**: 犬ID
    - **vaccine_type**: ワクチンの種類
    - **vaccination_date**: 接種日
    - **certificate_url**: 証明書URL（オプション）
    - **next_vaccination_date**: 次回接種予定日（オプション）
    
    認証が必要です
    """
    return await DogService.add_vaccination_record(dog_id, record, current_user["id"])


@router.get("/{dog_id}/vaccination", response_model=List[VaccinationRecordResponse])
async def get_vaccination_records(
    dog_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    犬のワクチン接種記録一覧を取得
    
    - **dog_id**: 犬ID
    
    認証が必要です
    """
    return await DogService.get_vaccination_records(dog_id, current_user["id"])