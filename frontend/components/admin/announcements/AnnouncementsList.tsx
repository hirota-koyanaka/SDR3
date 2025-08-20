'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

interface AnnouncementsListProps {
  announcements: Announcement[]
  onEdit: (announcement: Announcement) => void
  onDelete: (announcementId: string) => void
}

export function AnnouncementsList({ announcements, onEdit, onDelete }: AnnouncementsListProps) {
  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityLabel = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">重要</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">通常</span>
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">低</span>
    }
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">お知らせがありません</p>
        <p className="text-sm text-gray-400 mt-2">新規お知らせを作成してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div 
          key={announcement.id} 
          className={`bg-white rounded-lg shadow p-6 ${
            !announcement.is_published ? 'opacity-60' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3">
              {getPriorityIcon(announcement.priority)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {announcement.title}
                  </h3>
                  {getPriorityLabel(announcement.priority)}
                  {announcement.is_published ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      公開中
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      <EyeOff className="h-3 w-3 mr-1" />
                      下書き
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    作成: {format(new Date(announcement.created_at), 'yyyy/MM/dd', { locale: ja })}
                  </div>
                  {announcement.published_at && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      公開: {format(new Date(announcement.published_at), 'yyyy/MM/dd', { locale: ja })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(announcement)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(announcement.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}