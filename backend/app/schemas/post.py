from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PostStatus(str, Enum):
    """投稿ステータス"""
    PENDING = "pending"     # 承認待ち
    APPROVED = "approved"   # 承認済み
    REJECTED = "rejected"   # 却下


class PostCategory(str, Enum):
    """投稿カテゴリ"""
    GENERAL = "general"         # 一般
    QUESTION = "question"       # 質問
    EVENT = "event"            # イベント
    ANNOUNCEMENT = "announcement"  # お知らせ
    REVIEW = "review"          # レビュー


class PostCreate(BaseModel):
    """投稿作成用スキーマ"""
    content: str
    category: PostCategory = PostCategory.GENERAL
    hashtags: List[str] = []


class PostUpdate(BaseModel):
    """投稿更新用スキーマ"""
    content: Optional[str] = None
    category: Optional[PostCategory] = None
    hashtags: Optional[List[str]] = None


class PostModerate(BaseModel):
    """投稿モデレート用スキーマ（管理者用）"""
    status: PostStatus
    admin_memo: Optional[str] = None


class CommentCreate(BaseModel):
    """コメント作成用スキーマ"""
    content: str


class PostImageResponse(BaseModel):
    """投稿画像レスポンススキーマ"""
    id: str
    image_url: str
    display_order: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class HashtagResponse(BaseModel):
    """ハッシュタグレスポンススキーマ"""
    id: str
    name: str
    
    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    """コメントレスポンススキーマ"""
    id: str
    post_id: str
    user_id: str
    user_name: Optional[str]
    user_avatar: Optional[str]
    content: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    """投稿レスポンススキーマ"""
    id: str
    user_id: str
    user_name: Optional[str]
    user_avatar: Optional[str]
    content: str
    category: str
    status: str
    created_at: datetime
    updated_at: datetime
    images: List[PostImageResponse] = []
    hashtags: List[HashtagResponse] = []
    like_count: int = 0
    comment_count: int = 0
    is_liked: bool = False  # 現在のユーザーがいいねしているか
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """投稿一覧レスポンススキーマ"""
    total: int
    items: List[PostResponse]
    page: int
    per_page: int