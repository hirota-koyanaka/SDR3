'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, User, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  end_date: string
  location: string
  max_participants: number
  current_participants: number
  category: string
  status: string
  organizer: string
}

interface EventDetailModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false) // TODO: 実際の登録状況を取得
  
  const handleRegister = async () => {
    setIsRegistering(true)
    
    try {
      const response = await fetch(`/api/v1/events/${event.id}/register`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setIsRegistered(true)
        toast.success('イベントに参加登録しました')
      } else {
        throw new Error('登録に失敗しました')
      }
    } catch (error) {
      toast.error('参加登録に失敗しました')
    } finally {
      setIsRegistering(false)
    }
  }
  
  const handleCancel = async () => {
    setIsRegistering(true)
    
    try {
      const response = await fetch(`/api/v1/events/${event.id}/cancel`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setIsRegistered(false)
        toast.success('参加をキャンセルしました')
      } else {
        throw new Error('キャンセルに失敗しました')
      }
    } catch (error) {
      toast.error('キャンセルに失敗しました')
    } finally {
      setIsRegistering(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">募集中</Badge>
      case 'full':
        return <Badge variant="secondary">満員</Badge>
      case 'ended':
        return <Badge variant="outline">終了</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'レクリエーション':
        return 'bg-blue-100 text-blue-800'
      case '健康管理':
        return 'bg-green-100 text-green-800'
      case '教育':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const canRegister = event.status === 'active' && event.current_participants < event.max_participants
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            <div className="flex gap-2">
              {getStatusBadge(event.status)}
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* イベント詳細 */}
          <div>
            <h3 className="font-semibold mb-2">詳細</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>
          
          {/* イベント情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-3" size={20} />
                <div>
                  <p className="font-medium">開催日時</p>
                  <p className="text-sm">
                    {format(new Date(event.event_date), 'yyyy年MM月dd日（E）', { locale: ja })}
                  </p>
                  <p className="text-sm">
                    {format(new Date(event.event_date), 'HH:mm', { locale: ja })}
                    {event.end_date && (
                      <>
                        {' '}〜{' '}
                        {format(new Date(event.end_date), 'HH:mm', { locale: ja })}
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-3" size={20} />
                <div>
                  <p className="font-medium">場所</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Users className="mr-3" size={20} />
                <div>
                  <p className="font-medium">参加者</p>
                  <p className="text-sm">
                    {event.current_participants}/{event.max_participants}名
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="mr-3" size={20} />
                <div>
                  <p className="font-medium">主催者</p>
                  <p className="text-sm">{event.organizer}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">注意事項</h4>
            <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
              <li>参加には事前登録が必要です</li>
              <li>ワクチン接種証明書をご持参ください</li>
              <li>天候により中止となる場合があります</li>
              <li>キャンセルは開催日の前日までにお願いします</li>
            </ul>
          </div>
          
          {/* 参加ボタン */}
          <div className="flex gap-3">
            {isRegistered ? (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isRegistering}
                className="flex-1"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    キャンセル中...
                  </>
                ) : (
                  '参加をキャンセル'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={!canRegister || isRegistering}
                className="flex-1"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : canRegister ? (
                  '参加登録する'
                ) : (
                  '参加登録できません'
                )}
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}