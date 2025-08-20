'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface HashtagInputProps {
  hashtags: string[]
  onChange: (hashtags: string[]) => void
}

export function HashtagInput({ hashtags, onChange }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('')
  
  const addHashtag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim()
    if (cleanTag && !hashtags.includes(cleanTag) && hashtags.length < 10) {
      onChange([...hashtags, cleanTag])
    }
  }
  
  const removeHashtag = (index: number) => {
    onChange(hashtags.filter((_, i) => i !== index))
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addHashtag(inputValue)
        setInputValue('')
      }
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // スペースやカンマが入力されたらハッシュタグを追加
    if (value.includes(' ') || value.includes(',')) {
      const tags = value.split(/[,\s]+/).filter(Boolean)
      tags.forEach(tag => addHashtag(tag))
      setInputValue('')
    } else {
      setInputValue(value)
    }
  }
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        ハッシュタグ ({hashtags.length}/10)
      </label>
      
      {/* 追加済みハッシュタグ */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => removeHashtag(index)}
                className="hover:text-red-500 ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* 入力フィールド */}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="ハッシュタグを入力（スペースまたはEnterで追加）"
        disabled={hashtags.length >= 10}
      />
      <p className="text-xs text-gray-500 mt-1">
        例: 散歩, ドッグラン, 今治
      </p>
    </div>
  )
}