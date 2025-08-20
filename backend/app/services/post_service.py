from app.core.supabase import supabase
from app.schemas.post import PostCreate, PostUpdate, PostModerate, CommentCreate, PostStatus
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional


class PostService:
    @staticmethod
    async def create_post(post_data: PostCreate, user_id: str) -> Dict[str, Any]:
        """
        投稿を作成
        """
        try:
            # 投稿データの作成
            post = {
                "user_id": user_id,
                "content": post_data.content,
                "category": post_data.category.value,
                "status": PostStatus.PENDING.value  # 初期状態は承認待ち
            }
            
            # 投稿を保存
            result = supabase.table("posts").insert(post).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="投稿の作成に失敗しました"
                )
            
            post_id = result.data[0]["id"]
            
            # ハッシュタグの処理
            for tag_name in post_data.hashtags:
                # ハッシュタグが存在しなければ作成
                tag_result = supabase.table("hashtags").upsert(
                    {"name": tag_name}
                ).execute()
                
                if tag_result.data:
                    # 投稿とハッシュタグを関連付け
                    supabase.table("post_hashtags").insert({
                        "post_id": post_id,
                        "hashtag_id": tag_result.data[0]["id"]
                    }).execute()
            
            return await PostService.get_post(post_id, user_id)
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"投稿作成エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_post(post_id: str, current_user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        投稿詳細を取得
        """
        try:
            # 投稿情報を取得（関連データを含む）
            result = supabase.table("posts").select(
                "*, users!inner(name, avatar_url), post_images(*), post_hashtags(hashtags(*))"
            ).eq("id", post_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="投稿が見つかりません"
                )
            
            post = result.data[0]
            
            # いいね数を取得
            likes = supabase.table("likes").select("id", count="exact").eq("post_id", post_id).execute()
            post["like_count"] = likes.count if hasattr(likes, 'count') else 0
            
            # コメント数を取得
            comments = supabase.table("comments").select("id", count="exact").eq("post_id", post_id).execute()
            post["comment_count"] = comments.count if hasattr(comments, 'count') else 0
            
            # 現在のユーザーがいいねしているか確認
            if current_user_id:
                user_like = supabase.table("likes").select("id").eq("post_id", post_id).eq("user_id", current_user_id).execute()
                post["is_liked"] = len(user_like.data) > 0
            else:
                post["is_liked"] = False
            
            # データの整形
            post["user_name"] = post["users"]["name"] if post.get("users") else None
            post["user_avatar"] = post["users"]["avatar_url"] if post.get("users") else None
            post["images"] = post.get("post_images", [])
            post["hashtags"] = [h["hashtags"] for h in post.get("post_hashtags", [])]
            
            return post
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"投稿取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_feed(
        category: Optional[str] = None,
        hashtag: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        current_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        フィード（投稿一覧）を取得
        """
        try:
            # 基本クエリ（承認済み投稿のみ）
            query = supabase.table("posts").select(
                "*, users!inner(name, avatar_url), post_images(*), post_hashtags(hashtags(*))",
                count="exact"
            ).eq("status", PostStatus.APPROVED.value)
            
            # カテゴリフィルタ
            if category:
                query = query.eq("category", category)
            
            # ハッシュタグフィルタ（後で実装）
            # if hashtag:
            #     # ハッシュタグでフィルタリング
            #     pass
            
            # ページネーションと並び順
            result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            posts = result.data or []
            
            # 各投稿にいいね数とコメント数を追加
            for post in posts:
                post_id = post["id"]
                
                # いいね数
                likes = supabase.table("likes").select("id", count="exact").eq("post_id", post_id).execute()
                post["like_count"] = likes.count if hasattr(likes, 'count') else 0
                
                # コメント数
                comments = supabase.table("comments").select("id", count="exact").eq("post_id", post_id).execute()
                post["comment_count"] = comments.count if hasattr(comments, 'count') else 0
                
                # 現在のユーザーがいいねしているか
                if current_user_id:
                    user_like = supabase.table("likes").select("id").eq("post_id", post_id).eq("user_id", current_user_id).execute()
                    post["is_liked"] = len(user_like.data) > 0
                else:
                    post["is_liked"] = False
                
                # データの整形
                post["user_name"] = post["users"]["name"] if post.get("users") else None
                post["user_avatar"] = post["users"]["avatar_url"] if post.get("users") else None
                post["images"] = post.get("post_images", [])
                post["hashtags"] = [h["hashtags"] for h in post.get("post_hashtags", [])]
            
            return {
                "total": result.count if hasattr(result, 'count') else len(posts),
                "items": posts,
                "page": offset // limit + 1,
                "per_page": limit
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"フィード取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def toggle_like(post_id: str, user_id: str) -> Dict[str, Any]:
        """
        いいねの切り替え
        """
        try:
            # 既存のいいねを確認
            existing = supabase.table("likes").select("*").eq("post_id", post_id).eq("user_id", user_id).execute()
            
            if existing.data:
                # いいね解除
                supabase.table("likes").delete().eq("id", existing.data[0]["id"]).execute()
                liked = False
            else:
                # いいね追加
                supabase.table("likes").insert({
                    "post_id": post_id,
                    "user_id": user_id
                }).execute()
                liked = True
            
            # 現在のいいね数を取得
            likes = supabase.table("likes").select("id", count="exact").eq("post_id", post_id).execute()
            like_count = likes.count if hasattr(likes, 'count') else 0
            
            return {
                "liked": liked,
                "like_count": like_count
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"いいねエラー: {str(e)}"
            )
    
    @staticmethod
    async def add_comment(post_id: str, comment_data: CommentCreate, user_id: str) -> Dict[str, Any]:
        """
        コメントを追加
        """
        try:
            # 投稿が存在し、承認済みか確認
            post = supabase.table("posts").select("status").eq("id", post_id).execute()
            
            if not post.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="投稿が見つかりません"
                )
            
            if post.data[0]["status"] != PostStatus.APPROVED.value:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="この投稿にはコメントできません"
                )
            
            # コメントを作成
            comment = {
                "post_id": post_id,
                "user_id": user_id,
                "content": comment_data.content
            }
            
            result = supabase.table("comments").insert(comment).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="コメントの投稿に失敗しました"
                )
            
            # ユーザー情報を含めて返す
            comment_id = result.data[0]["id"]
            comment_with_user = supabase.table("comments").select(
                "*, users!inner(name, avatar_url)"
            ).eq("id", comment_id).execute()
            
            if comment_with_user.data:
                comment = comment_with_user.data[0]
                comment["user_name"] = comment["users"]["name"] if comment.get("users") else None
                comment["user_avatar"] = comment["users"]["avatar_url"] if comment.get("users") else None
                return comment
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"コメント追加エラー: {str(e)}"
            )
    
    @staticmethod
    async def get_comments(post_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """
        投稿のコメント一覧を取得
        """
        try:
            result = supabase.table("comments").select(
                "*, users!inner(name, avatar_url)"
            ).eq("post_id", post_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            comments = result.data or []
            
            # データの整形
            for comment in comments:
                comment["user_name"] = comment["users"]["name"] if comment.get("users") else None
                comment["user_avatar"] = comment["users"]["avatar_url"] if comment.get("users") else None
            
            return comments
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"コメント取得エラー: {str(e)}"
            )
    
    @staticmethod
    async def moderate_post(post_id: str, moderation: PostModerate, admin_id: str) -> Dict[str, Any]:
        """
        投稿をモデレート（管理者用）
        """
        try:
            # 投稿の存在確認
            post = supabase.table("posts").select("id").eq("id", post_id).execute()
            
            if not post.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="投稿が見つかりません"
                )
            
            # ステータスを更新
            update_data = {
                "status": moderation.status.value
            }
            
            result = supabase.table("posts").update(update_data).eq("id", post_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="投稿のモデレートに失敗しました"
                )
            
            return result.data[0]
            
        except Exception as e:
            if hasattr(e, 'status_code'):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"モデレートエラー: {str(e)}"
            )