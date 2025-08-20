'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    name: string
    avatar_url?: string | null
  }
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: '可愛いですね！',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user: {
        id: '2',
        name: '田中美香',
        avatar_url: null,
      }
    },
    {
      id: '2',
      content: 'うちの子と似ています😊',
      created_at: new Date(Date.now() - 900000).toISOString(),
      user: {
        id: '3',
        name: '鈴木健太',
        avatar_url: null,
      }
    }
  ])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })
      
      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [...prev, comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="border-t bg-gray-50">
      {/* コメント一覧 */}
      <div className="p-4 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {comment.user.avatar_url ? (
                  <Image
                    src={comment.user.avatar_url}
                    alt={comment.user.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg px-3 py-2">
                <p className="font-medium text-sm">{comment.user.name}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-3">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* コメント入力 */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを書く..."
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}