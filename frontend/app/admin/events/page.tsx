'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EventsList } from '@/components/admin/events/EventsList'
import { Button } from '@/components/ui/button'
import { EventFormModal } from '@/components/admin/modals/EventFormModal'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const supabase = createClient()

  const fetchEvents = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    
    if (!error && data) {
      setEvents(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setIsFormOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) return
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
    
    if (!error) {
      fetchEvents()
      alert('イベントを削除しました')
    } else {
      alert('削除に失敗しました')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingEvent(null)
    fetchEvents()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
          <p className="text-gray-600 mt-1">ドッグランのイベントを管理します</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規イベント作成
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              読み込み中...
            </div>
          ) : (
            <EventsList 
              events={events}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="font-semibold">イベント統計</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">今月のイベント</span>
                <span className="font-medium">
                  {events.filter(e => {
                    const eventDate = new Date(e.event_date)
                    const now = new Date()
                    return eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear()
                  }).length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">今後のイベント</span>
                <span className="font-medium">
                  {events.filter(e => new Date(e.event_date) >= new Date()).length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総イベント数</span>
                <span className="font-medium">{events.length}件</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">イベント運営のヒント</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 定期的なイベント開催で利用者の満足度向上</li>
              <li>• 季節に応じたイベント企画</li>
              <li>• SNSでの事前告知を忘れずに</li>
              <li>• 参加者アンケートで改善点を収集</li>
            </ul>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <EventFormModal
          event={editingEvent}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}