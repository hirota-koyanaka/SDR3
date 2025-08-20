'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Heart, MessageCircle, Share, User, MoreHorizontal } from 'lucide-react'
import { CommentSection } from './CommentSection'
import { ImageGallery } from './ImageGallery'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Post {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    name: string
    avatar_url?: string | null
  }
  images?: string[]
  hashtags?: string[]
  likes_count: number
  comments_count: number
  is_liked: boolean
  category?: string
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  
  const handleLike = async () => {
    try {
      const response = await fetch(`/api/v1/posts/${post.id}/like`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikeCount(data.liked ? likeCount + 1 : likeCount - 1)
      }
    } catch (error) {
      console.error('いいねに失敗しました:', error)
    }
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.name}の投稿`,
          text: post.content,
          url: `${window.location.origin}/feed/post/${post.id}`,
        })
      } catch (error) {
        console.log('シェアがキャンセルされました')
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(`${window.location.origin}/feed/post/${post.id}`)
      alert('URLをクリップボードにコピーしました')
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow border">
      {/* ヘッダー */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
            {post.user.avatar_url ? (
              <Image
                src={post.user.avatar_url}
                alt={post.user.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">{post.user.name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ja,
              })}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>投稿を報告</DropdownMenuItem>
            <DropdownMenuItem>ユーザーをブロック</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* コンテンツ */}
      <div className="px-4 pb-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-primary hover:underline cursor-pointer text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* 画像 */}
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}
      
      {/* アクション */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm">{post.comments_count}</span>
            </button>
          </div>
          
          <button
            onClick={handleShare}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            <Share size={20} />
          </button>
        </div>
      </div>
      
      {/* コメント */}
      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </div>
  )
}