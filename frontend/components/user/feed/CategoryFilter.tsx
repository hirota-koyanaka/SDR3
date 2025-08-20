'use client'

import { Button } from '@/components/ui/button'

interface CategoryFilterProps {
  selected: string
  onChange: (category: string) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'photo', label: '写真' },
    { value: 'diary', label: '日記' },
    { value: 'question', label: '質問' },
    { value: 'event', label: 'イベント' },
  ]
  
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selected === category.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(category.value)}
          className="text-sm"
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}