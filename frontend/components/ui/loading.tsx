import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loading({ className, size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-b-2 border-blue-600',
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading size="lg" text="読み込み中..." />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <Loading size="md" text="データを取得中..." />
    </div>
  )
}