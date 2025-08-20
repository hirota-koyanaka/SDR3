from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional, Dict, Any
from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostModerate,
    PostResponse,
    PostListResponse,
    CommentCreate,
    CommentResponse
)
from app.services.post_service import PostService
from app.core.security import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/posts", tags=["SNS投稿"])


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    投稿を作成
    
    - **content**: 投稿内容
    - **category**: カテゴリ（general/question/event/announcement/review）
    - **hashtags**: ハッシュタグリスト
    
    認証が必要です
    """
    return await PostService.create_post(post_data, current_user["id"])


@router.get("/feed", response_model=PostListResponse)
async def get_feed(
    category: Optional[str] = Query(None, description="カテゴリでフィルタ"),
    hashtag: Optional[str] = Query(None, description="ハッシュタグでフィルタ"),
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    フィード（投稿一覧）を取得
    
    - **category**: カテゴリでフィルタ
    - **hashtag**: ハッシュタグでフィルタ
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    
    認証は任意（いいね状態の取得に使用）
    """
    user_id = current_user["id"] if current_user else None
    return await PostService.get_feed(category, hashtag, limit, offset, user_id)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    投稿詳細を取得
    
    - **post_id**: 投稿ID
    
    認証は任意（いいね状態の取得に使用）
    """
    user_id = current_user["id"] if current_user else None
    return await PostService.get_post(post_id, user_id)


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    いいねの切り替え
    
    - **post_id**: 投稿ID
    
    認証が必要です
    """
    return await PostService.toggle_like(post_id, current_user["id"])


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    コメントを投稿
    
    - **post_id**: 投稿ID
    - **content**: コメント内容
    
    認証が必要です
    """
    return await PostService.add_comment(post_id, comment_data, current_user["id"])


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: str,
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット")
):
    """
    投稿のコメント一覧を取得
    
    - **post_id**: 投稿ID
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    """
    return await PostService.get_comments(post_id, limit, offset)


# 管理者用エンドポイント
@router.put("/admin/{post_id}/moderate", response_model=PostResponse)
async def moderate_post(
    post_id: str,
    moderation: PostModerate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    投稿をモデレート（管理者用）
    
    - **post_id**: 投稿ID
    - **status**: 新しいステータス（pending/approved/rejected）
    - **admin_memo**: 管理者メモ（オプション）
    
    管理者権限が必要です
    """
    return await PostService.moderate_post(post_id, moderation, admin_user["id"])


@router.get("/admin/pending", response_model=PostListResponse)
async def get_pending_posts(
    limit: int = Query(20, le=100, description="取得件数"),
    offset: int = Query(0, description="オフセット"),
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    承認待ち投稿一覧を取得（管理者用）
    
    - **limit**: 取得件数（最大100）
    - **offset**: オフセット
    
    管理者権限が必要です
    """
    # 承認待ちステータスでフィード取得
    return await PostService.get_feed(
        category=None,
        hashtag=None,
        limit=limit,
        offset=offset,
        current_user_id=admin_user["id"]
    )