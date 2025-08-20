'use client'

import { Calendar, FileText, AlertCircle, CheckCircle, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  title: string
  content: string
  type: 'event' | 'application' | 'announcement' | 'maintenance'
  is_read: boolean
  created_at: string
}

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="text-blue-500" size={20} />
      case 'application':
        return <CheckCircle className="text-green-500" size={20} />
      case 'announcement':
        return <Bell className="text-purple-500" size={20} />
      case 'maintenance':
        return <AlertCircle className="text-orange-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
    }
  }
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event':
        return 'イベント'
      case 'application':
        return '申請'
      case 'announcement':
        return 'お知らせ'
      case 'maintenance':
        return 'メンテナンス'
      default:
        return 'その他'
    }
  }
  
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800'
      case 'application':
        return 'bg-green-100 text-green-800'
      case 'announcement':
        return 'bg-purple-100 text-purple-800'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }
  
  return (
    <div
      onClick={handleClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${notification.is_read 
          ? 'bg-white border-gray-200 hover:shadow-md' 
          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(notification.type)}
        </div>
        
        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold ${notification.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
              {notification.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(notification.type)}`}>
                {getTypeLabel(notification.type)}
              </span>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-blue-800'} line-clamp-2`}>
            {notification.content}
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}