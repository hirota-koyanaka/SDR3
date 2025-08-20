'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Coins, Edit, Trash2 } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location?: string
  max_participants?: number
  current_participants?: number
  fee?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
}

interface EventsListProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventsList({ events, onEdit, onDelete }: EventsListProps) {
  const getStatusBadge = (event: Event) => {
    const eventDate = new Date(event.event_date)
    const now = new Date()
    
    if (event.status === 'cancelled') {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">中止</span>
    }
    
    if (eventDate > now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">開催予定</span>
    } else if (eventDate.toDateString() === now.toDateString()) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">本日開催</span>
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">終了</span>
    }
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">イベントがありません</p>
        <p className="text-sm text-gray-400 mt-2">新規イベントを作成してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                {getStatusBadge(event)}
              </div>
              <p className="text-gray-600 mt-1">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(event)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(event.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {format(new Date(event.event_date), 'yyyy年MM月dd日', { locale: ja })}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {event.start_time} - {event.end_time}
            </div>
            {event.location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {event.location}
              </div>
            )}
            {event.max_participants && (
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                {event.current_participants || 0}/{event.max_participants}名
              </div>
            )}
            {event.fee !== undefined && (
              <div className="flex items-center text-gray-600">
                <Coins className="h-4 w-4 mr-2 text-gray-400" />
                {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
              </div>
            )}
          </div>

          {event.max_participants && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">参加状況</span>
                <span className="text-gray-900 font-medium">
                  {Math.round(((event.current_participants || 0) / event.max_participants) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(((event.current_participants || 0) / event.max_participants) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}