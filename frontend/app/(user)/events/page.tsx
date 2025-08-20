'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventDetailModal } from '@/components/user/events/EventDetailModal'
import { EventsList } from '@/components/user/events/EventsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [view, setView] = useState('calendar')
  
  // TODO: 実際のAPIから取得
  const events = [
    {
      id: '1',
      title: '新年イベント',
      description: 'ドッグランレースや撮影会など楽しいイベントが盛りだくさん！',
      event_date: '2024-01-14T10:00:00',
      end_date: '2024-01-14T16:00:00',
      location: '里山ドッグラン',
      max_participants: 50,
      current_participants: 23,
      category: 'レクリエーション',
      status: 'active',
      organizer: '里山ドッグラン運営',
    },
    {
      id: '2',
      title: '春の健康診断',
      description: '愛犬の健康チェックを行います。獣医師が無料で診断します。',
      event_date: '2024-03-15T09:00:00',
      end_date: '2024-03-15T15:00:00',
      location: '里山ドッグラン',
      max_participants: 30,
      current_participants: 15,
      category: '健康管理',
      status: 'active',
      organizer: '今治動物病院',
    },
  ]
  
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.event_date,
    end: event.end_date,
    extendedProps: event,
  }))
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">イベント</h1>
      
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          <TabsTrigger value="list">リスト</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <div className="bg-white rounded-lg shadow p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
              locale="ja"
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
              buttonText={{
                today: '今日',
                month: '月',
                week: '週',
              }}
              dayHeaderFormat={{ weekday: 'short' }}
              eventDisplay="block"
              eventBackgroundColor="#3B82F6"
              eventBorderColor="#3B82F6"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <EventsList events={events} onSelect={setSelectedEvent} />
        </TabsContent>
      </Tabs>
      
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}