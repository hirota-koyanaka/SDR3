"use client"

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ 
  title = 'エラーが発生しました', 
  message = '申し訳ございません。しばらく時間をおいて再度お試しください。',
  onRetry 
}: ErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ 
  title = 'データがありません',
  message = '表示するデータがありません。',
  action
}: {
  title?: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex flex-col items-center text-center">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {action}
      </div>
    </div>
  )
}