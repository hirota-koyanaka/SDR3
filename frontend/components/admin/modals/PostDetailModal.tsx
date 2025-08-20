'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  User, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Flag,
  Hash,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react'

interface PostDetailModalProps {
  post: any
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onReject: (reason: string) => void
  onDelete: () => void
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: PostDetailModalProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason)
      setRejectReason('')
      setShowRejectForm(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>投稿詳細</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {post.image_url && (
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={post.image_url} 
                alt="投稿画像"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>投稿者: {post.users?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(post.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-2" />
                <span>いいね: {post.likes_count || 0}件</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>コメント: {post.comments_count || 0}件</span>
              </div>
              {post.report_count > 0 && (
                <div className="flex items-center text-sm text-orange-600">
                  <Flag className="h-4 w-4 mr-2" />
                  <span>通報: {post.report_count}件</span>
                </div>
              )}
            </div>
          </div>

          {post.status === 'rejected' && post.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">却下理由:</p>
              <p className="text-sm text-red-700 mt-1">{post.rejection_reason}</p>
            </div>
          )}

          {post.report_count > 0 && post.reports && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800 mb-2">通報内容:</p>
              <ul className="space-y-1">
                {post.reports.map((report: any, index: number) => (
                  <li key={index} className="text-sm text-orange-700">
                    • {report.reason}: {report.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t pt-4">
            {post.status === 'pending' && !showRejectForm && (
              <div className="flex gap-3">
                <Button
                  onClick={onApprove}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  承認する
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  却下する
                </Button>
                <Button
                  onClick={onDelete}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </Button>
              </div>
            )}

            {showRejectForm && (
              <div className="space-y-3">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="却下理由を入力してください"
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    disabled={!rejectReason.trim()}
                    className="flex-1"
                  >
                    却下を確定
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectReason('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {post.status === 'approved' && (
              <div className="flex items-center justify-center py-4 text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">承認済み</span>
              </div>
            )}

            {post.status === 'rejected' && (
              <div className="flex items-center justify-center py-4 text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">却下済み</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}