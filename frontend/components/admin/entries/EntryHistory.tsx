'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { User, Clock, Calendar, ArrowRight } from 'lucide-react'

interface EntryLog {
  id: string
  user_id: string
  entry_time: string
  exit_time: string | null
  users?: {
    name: string
    email: string
  }
}

export function EntryHistory() {
  const [entries, setEntries] = useState<EntryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'))
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [dateFilter])

  const fetchEntries = async () => {
    setIsLoading(true)
    
    const startOfDay = new Date(dateFilter)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateFilter)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('entry_logs')
      .select('*, users(name, email)')
      .gte('entry_time', startOfDay.toISOString())
      .lte('entry_time', endOfDay.toISOString())
      .order('entry_time', { ascending: false })
    
    if (!error && data) {
      setEntries(data)
    }
    setIsLoading(false)
  }

  const calculateDuration = (entryTime: string, exitTime: string | null) => {
    if (!exitTime) return '利用中'
    
    const entry = new Date(entryTime)
    const exit = new Date(exitTime)
    const diff = exit.getTime() - entry.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">入退場履歴</h3>
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          読み込み中...
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          この日の入退場記録はありません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利用者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入場時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  退場時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  滞在時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.users?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.users?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(entry.entry_time), 'HH:mm', { locale: ja })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.exit_time ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {format(new Date(entry.exit_time), 'HH:mm', { locale: ja })}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {calculateDuration(entry.entry_time, entry.exit_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.exit_time ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        退場済み
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        利用中
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            総利用者数: <span className="font-medium text-gray-900">{entries.length}組</span>
          </div>
          <div>
            現在利用中: <span className="font-medium text-green-600">
              {entries.filter(e => !e.exit_time).length}組
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}