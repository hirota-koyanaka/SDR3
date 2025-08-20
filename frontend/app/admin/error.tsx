'use client'

import { useEffect } from 'react'
import { ErrorMessage } from '@/components/ui/error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorMessage
        title="予期しないエラーが発生しました"
        message={error.message || 'システムエラーが発生しました。管理者にお問い合わせください。'}
        onRetry={reset}
      />
    </div>
  )
}