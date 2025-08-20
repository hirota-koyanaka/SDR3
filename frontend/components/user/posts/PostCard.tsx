'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PostCardProps {
  post: {
    id: string
    author_id: string
    content: string
    image_urls?: string[]
    hashtags?: string[]
    likes_count: number
    comments_count: number
    created_at: string
    author?: {
      name: string
      avatar_url?: string
    }
  }
  currentUserId?: string
  onUpdate?: () => void
}

export function PostCard({ post, currentUserId, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const supabase = createClient()
  
  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('ログインが必要です')
      return
    }
    
    try {
      if (isLiked) {
        // いいねを取り消し
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId)
        
        if (!error) {
          setIsLiked(false)
          setLikesCount(prev => Math.max(0, prev - 1))
        }
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: currentUserId
          })
        
        if (!error) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('エラーが発生しました')
    }
  }
  
  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, author:profiles(name)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setComments(data)
      }
    } catch (error) {
      console.error('Load comments error:', error)
    }
  }
  
  const handleComment = async () => {
    if (!currentUserId || !comment.trim()) return
    
    setIsSubmittingComment(true)
    
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          author_id: currentUserId,
          content: comment
        })
      
      if (!error) {
        toast.success('コメントを投稿しました')
        setComment('')
        loadComments()
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Comment error:', error)
      toast.error('コメントの投稿に失敗しました')
    } finally {
      setIsSubmittingComment(false)
    }
  }
  
  const toggleComments = () => {
    setShowComments(!showComments)
    if (!showComments && comments.length === 0) {
      loadComments()
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">🐕</span>
              )}
            </div>
            <div>
              <p className="font-semibold">{post.author?.name || '匿名'}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ja
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {post.image_urls && post.image_urls.length > 0 && (
          <div className={`grid gap-2 ${
            post.image_urls.length === 1 ? 'grid-cols-1' :
            post.image_urls.length === 2 ? 'grid-cols-2' :
            post.image_urls.length === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {post.image_urls.map((url, index) => (
              <div
                key={index}
                className={`relative ${
                  post.image_urls!.length === 3 && index === 0 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img
                  src={url}
                  alt={`投稿画像 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                  style={{
                    maxHeight: post.image_urls!.length === 1 ? '400px' : '200px'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount > 0 && likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleComments}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comments_count > 0 && post.comments_count}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full space-y-3 pt-3 border-t">
            {currentUserId && (
              <div className="flex gap-2">
                <Input
                  placeholder="コメントを入力..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleComment()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!comment.trim() || isSubmittingComment}
                >
                  送信
                </Button>
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold mr-2">
                        {comment.author?.name || '匿名'}
                      </span>
                      {comment.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ja
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}