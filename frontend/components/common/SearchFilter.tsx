'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Filter, X, Calendar } from 'lucide-react'
// import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { debounce } from '@/lib/utils'

interface FilterOption {
  label: string
  value: string
}

interface SearchFilterProps {
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  searchPlaceholder?: string
  filters?: {
    name: string
    label: string
    type: 'select' | 'date' | 'dateRange' | 'checkbox'
    options?: FilterOption[]
    defaultValue?: any
  }[]
  className?: string
}

export function SearchFilter({
  onSearch,
  onFilter,
  searchPlaceholder = '検索...',
  filters = [],
  className = ''
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  
  // デバウンスされた検索
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (onSearch) {
        onSearch(query)
      }
    }, 300),
    [onSearch]
  )
  
  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])
  
  const handleFilterChange = (name: string, value: any) => {
    const newFilters = {
      ...activeFilters,
      [name]: value
    }
    
    if (value === null || value === undefined || value === '') {
      delete newFilters[name]
    }
    
    setActiveFilters(newFilters)
    
    if (onFilter) {
      onFilter(newFilters)
    }
  }
  
  const clearFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
    if (onFilter) {
      onFilter({})
    }
    if (onSearch) {
      onSearch('')
    }
  }
  
  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchQuery.length > 0
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filters.length > 0 && (
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            フィルター
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-primary rounded-full text-xs">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </Button>
        )}
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {showFilters && filters.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.name}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <Select
                    value={activeFilters[filter.name] || ''}
                    onValueChange={(value) => handleFilterChange(filter.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {filter.type === 'date' && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="date"
                      value={activeFilters[filter.name] || ''}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                
                {filter.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={filter.name}
                      checked={activeFilters[filter.name] || false}
                      onChange={(e) => handleFilterChange(filter.name, e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor={filter.name} className="text-sm">
                      {filter.label}
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ユーザー検索コンポーネント
export function UserSearchFilter({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <SearchFilter
      searchPlaceholder="名前、メールアドレスで検索..."
      onSearch={(query) => onFilter({ search: query })}
      onFilter={onFilter}
      filters={[
        {
          name: 'status',
          label: 'ステータス',
          type: 'select',
          options: [
            { label: '承認済み', value: 'approved' },
            { label: '保留中', value: 'pending' },
            { label: '却下', value: 'rejected' }
          ]
        },
        {
          name: 'hasdog',
          label: '愛犬登録',
          type: 'select',
          options: [
            { label: '登録済み', value: 'true' },
            { label: '未登録', value: 'false' }
          ]
        },
        {
          name: 'created_at',
          label: '登録日',
          type: 'date'
        }
      ]}
    />
  )
}

// イベント検索コンポーネント
export function EventSearchFilter({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <SearchFilter
      searchPlaceholder="イベント名で検索..."
      onSearch={(query) => onFilter({ search: query })}
      onFilter={onFilter}
      filters={[
        {
          name: 'date',
          label: '開催日',
          type: 'date'
        },
        {
          name: 'status',
          label: 'ステータス',
          type: 'select',
          options: [
            { label: '開催予定', value: 'upcoming' },
            { label: '開催中', value: 'ongoing' },
            { label: '終了', value: 'past' }
          ]
        },
        {
          name: 'available',
          label: '空きあり',
          type: 'checkbox'
        }
      ]}
    />
  )
}

// 投稿検索コンポーネント
export function PostSearchFilter({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <SearchFilter
      searchPlaceholder="投稿内容、ハッシュタグで検索..."
      onSearch={(query) => onFilter({ search: query })}
      onFilter={onFilter}
      filters={[
        {
          name: 'has_image',
          label: '画像あり',
          type: 'checkbox'
        },
        {
          name: 'date_from',
          label: '投稿日（開始）',
          type: 'date'
        },
        {
          name: 'date_to',
          label: '投稿日（終了）',
          type: 'date'
        }
      ]}
    />
  )
}