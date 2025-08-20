'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const categories = [
    { value: 'diary', label: '日記', description: '日常の出来事や思い出' },
    { value: 'photo', label: '写真', description: '愛犬の可愛い写真' },
    { value: 'question', label: '質問', description: '困ったことや相談' },
    { value: 'event', label: 'イベント', description: 'イベント情報や参加報告' },
    { value: 'news', label: 'お知らせ', description: '重要な情報の共有' },
  ]
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        カテゴリ
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="カテゴリを選択" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              <div>
                <div className="font-medium">{category.label}</div>
                <div className="text-xs text-gray-500">{category.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}