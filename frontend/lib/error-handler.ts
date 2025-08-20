import { toast } from 'react-hot-toast'

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = '認証が必要です') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'アクセス権限がありません') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message)
    this.name = 'NetworkError'
  }
}

interface ErrorHandlerOptions {
  showToast?: boolean
  fallbackMessage?: string
  onAuthError?: () => void
}

export function handleError(error: unknown, options: ErrorHandlerOptions = {}): void {
  const {
    showToast = true,
    fallbackMessage = 'エラーが発生しました',
    onAuthError
  } = options

  console.error('Error:', error)

  let message = fallbackMessage
  let shouldRedirect = false

  if (error instanceof AuthenticationError) {
    message = error.message
    shouldRedirect = true
    if (onAuthError) {
      onAuthError()
    }
  } else if (error instanceof AuthorizationError) {
    message = error.message
  } else if (error instanceof ValidationError) {
    message = error.message
    if (error.fields) {
      const fieldErrors = Object.entries(error.fields)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n')
      message = `${message}\n${fieldErrors}`
    }
  } else if (error instanceof ApiError) {
    message = error.message
    if (error.status === 401) {
      shouldRedirect = true
      if (onAuthError) {
        onAuthError()
      }
    }
  } else if (error instanceof NetworkError) {
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  }

  if (showToast) {
    toast.error(message)
  }

  if (shouldRedirect && typeof window !== 'undefined') {
    // 認証エラーの場合はログインページへリダイレクト
    const isAdminPage = window.location.pathname.startsWith('/admin')
    window.location.href = isAdminPage ? '/admin/login' : '/login'
  }
}

// APIレスポンスエラーをパース
export function parseApiError(response: Response, data?: any): Error {
  if (response.status === 401) {
    return new AuthenticationError()
  }

  if (response.status === 403) {
    return new AuthorizationError()
  }

  if (response.status === 422 && data?.detail) {
    // FastAPIのバリデーションエラー
    if (Array.isArray(data.detail)) {
      const fields: Record<string, string[]> = {}
      data.detail.forEach((error: any) => {
        const field = error.loc[error.loc.length - 1]
        if (!fields[field]) {
          fields[field] = []
        }
        fields[field].push(error.msg)
      })
      return new ValidationError('入力内容にエラーがあります', fields)
    }
    return new ValidationError(data.detail)
  }

  if (response.status >= 400 && response.status < 500) {
    return new ApiError(
      data?.detail || `クライアントエラー: ${response.status}`,
      response.status,
      data?.code,
      data
    )
  }

  if (response.status >= 500) {
    return new ApiError(
      'サーバーエラーが発生しました。しばらく経ってから再度お試しください。',
      response.status,
      data?.code,
      data
    )
  }

  return new Error(data?.detail || 'エラーが発生しました')
}

// 非同期処理のラッパー
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await asyncFn()
  } catch (error) {
    handleError(error, options)
    return null
  }
}