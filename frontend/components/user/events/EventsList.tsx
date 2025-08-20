'use client'

import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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

interface EventsListProps {
  events: Event[]
  onSelect: (event: Event) => void
}

export function EventsList({ events, onSelect }: EventsListProps) {
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
  
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500">現在開催予定のイベントはありません</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>
                <p className="text-gray-600 mb-3">{event.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="mr-1" size={16} />
                    {format(new Date(event.event_date), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    {event.end_date && (
                      <>
                        {' '}〜{' '}
                        {format(new Date(event.end_date), 'HH:mm', { locale: ja })}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="mr-1" size={16} />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="mr-1" size={16} />
                    {event.current_participants}/{event.max_participants}名
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
                <Button onClick={() => onSelect(event)} size="sm">
                  詳細を見る
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-500">
                主催: {event.organizer}
              </span>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}