'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Plus, Trash2 } from 'lucide-react'

interface Holiday {
  id: string
  date: string
  reason: string
}

export function SpecialHolidaysSettings() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchHolidays()
  }, [])

  const fetchHolidays = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('special_holidays')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    if (!error && data) {
      setHolidays(data)
    }
    setIsLoading(false)
  }

  const handleAdd = async () => {
    if (!newHoliday.date || !newHoliday.reason.trim()) {
      alert('日付と理由を入力してください')
      return
    }

    const { error } = await supabase
      .from('special_holidays')
      .insert([newHoliday])
    
    if (!error) {
      setNewHoliday({ date: '', reason: '' })
      fetchHolidays()
      alert('特別休業日を追加しました')
    } else {
      alert('追加に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この休業日を削除しますか？')) return
    
    const { error } = await supabase
      .from('special_holidays')
      .delete()
      .eq('id', id)
    
    if (!error) {
      fetchHolidays()
      alert('削除しました')
    } else {
      alert('削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold">特別休業日の追加</h2>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="holiday-date">日付</Label>
            <Input
              id="holiday-date"
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="holiday-reason">理由</Label>
            <Input
              id="holiday-reason"
              placeholder="例: 設備メンテナンス"
              value={newHoliday.reason}
              onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="font-semibold">登録済みの特別休業日</h3>
        </div>
        
        {holidays.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            特別休業日は設定されていません
          </div>
        ) : (
          <div className="divide-y">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-medium">
                    {format(new Date(holiday.date), 'yyyy年MM月dd日(E)', { locale: ja })}
                  </div>
                  <span className="text-gray-700">{holiday.reason}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(holiday.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}