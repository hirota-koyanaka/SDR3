'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { User, Dog, Clock, LogOut } from 'lucide-react'

interface Visitor {
  id: string
  user_id: string
  entry_time: string
  exit_time: string | null
  users?: {
    name: string
    email: string
  }
  dogs?: Array<{
    name: string
    breed: string
  }>
}

interface CurrentVisitorsListProps {
  visitors: Visitor[]
  onCheckOut: (entryId: string) => void
}

export function CurrentVisitorsList({ visitors, onCheckOut }: CurrentVisitorsListProps) {
  const calculateDuration = (entryTime: string) => {
    const entry = new Date(entryTime)
    const now = new Date()
    const diff = now.getTime() - entry.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  if (visitors.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        現在利用中のユーザーはいません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              利用者
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              同伴犬
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              入場時間
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              滞在時間
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {visitor.users?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {visitor.users?.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {visitor.dogs && visitor.dogs.length > 0 ? (
                  <div className="space-y-1">
                    {visitor.dogs.map((dog, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Dog className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{dog.name}</span>
                        <span className="text-gray-500 ml-2">({dog.breed})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {format(new Date(visitor.entry_time), 'HH:mm', { locale: ja })}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(visitor.entry_time), 'yyyy/MM/dd', { locale: ja })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600">
                  {calculateDuration(visitor.entry_time)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCheckOut(visitor.id)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退場
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}