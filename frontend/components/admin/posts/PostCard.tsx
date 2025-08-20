'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  Trash2
} from 'lucide-react'

interface PostCardProps {
  post: any
  onApprove: () => void
  onReject: (reason: string) => void
  onDelete: () => void
  onDetail: () => void
}

export function PostCard({ post, onApprove, onReject, onDelete, onDetail }: PostCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason)
      setShowRejectForm(false)
      setRejectReason('')
    }
  }

  const getStatusBadge = () => {
    switch (post.status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">承認待ち</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">承認済み</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">却下</span>
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      {post.image_url && (
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {post.report_count > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 flex items-center">
                <Flag className="h-3 w-3 mr-1" />
                通報 {post.report_count}件
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.content}
        </h3>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {post.users?.name || 'Unknown User'}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(post.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {post.likes_count || 0}
          </span>
          <span className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.comments_count || 0}
          </span>
        </div>

        {showRejectForm ? (
          <div className="space-y-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="却下理由を入力"
              className="h-20"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1"
              >
                却下
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason('')
                }}
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onDetail}
              className="flex-1"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {post.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={onApprove}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}