'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Save } from 'lucide-react'

interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    is_closed: boolean
  }
}

export function BusinessHoursSettings() {
  const [hours, setHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '17:00', is_closed: false },
    tuesday: { open: '09:00', close: '17:00', is_closed: false },
    wednesday: { open: '09:00', close: '17:00', is_closed: false },
    thursday: { open: '09:00', close: '17:00', is_closed: false },
    friday: { open: '09:00', close: '17:00', is_closed: false },
    saturday: { open: '09:00', close: '17:00', is_closed: false },
    sunday: { open: '09:00', close: '17:00', is_closed: false },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const daysOfWeek = [
    { key: 'monday', label: '月曜日' },
    { key: 'tuesday', label: '火曜日' },
    { key: 'wednesday', label: '水曜日' },
    { key: 'thursday', label: '木曜日' },
    { key: 'friday', label: '金曜日' },
    { key: 'saturday', label: '土曜日' },
    { key: 'sunday', label: '日曜日' },
  ]

  useEffect(() => {
    fetchBusinessHours()
  }, [])

  const fetchBusinessHours = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .single()
    
    if (!error && data) {
      setHours(data.hours || hours)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    const { error } = await supabase
      .from('business_hours')
      .upsert({
        id: 1, // 単一レコード
        hours: hours,
        updated_at: new Date().toISOString(),
      })
    
    if (!error) {
      alert('営業時間を更新しました')
    } else {
      alert('更新に失敗しました')
    }
    
    setIsSaving(false)
  }

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }))
  }

  const handleClosedChange = (day: string, isClosed: boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        is_closed: isClosed,
      }
    }))
  }

  const applyToAll = () => {
    const monday = hours.monday
    const newHours: BusinessHours = {}
    daysOfWeek.forEach(day => {
      newHours[day.key] = { ...monday }
    })
    setHours(newHours)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            <h2 className="text-lg font-semibold">営業時間設定</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={applyToAll}
          >
            月曜日の設定を全曜日に適用
          </Button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day.key} className="flex items-center gap-4">
            <div className="w-24">
              <Label className="font-medium">{day.label}</Label>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="time"
                value={hours[day.key]?.open || '09:00'}
                onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                disabled={hours[day.key]?.is_closed}
                className="w-32"
              />
              <span className="text-gray-500">〜</span>
              <Input
                type="time"
                value={hours[day.key]?.close || '17:00'}
                onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                disabled={hours[day.key]?.is_closed}
                className="w-32"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hours[day.key]?.is_closed || false}
                onChange={(e) => handleClosedChange(day.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm">休業</span>
            </label>
          </div>
        ))}
        
        <div className="pt-4 border-t flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '設定を保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}