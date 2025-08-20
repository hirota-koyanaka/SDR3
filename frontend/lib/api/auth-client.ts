import { createClient } from '@/lib/supabase/client'
import { parseApiError, NetworkError } from '@/lib/error-handler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

class AuthenticatedApiClient {
  private supabase = createClient()

  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session?.access_token || null
  }

  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const token = await this.getAuthToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
    }

    if (options.body && options.method !== 'GET') {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw parseApiError(response, errorData)
      }

      // 204 No Content の場合は空のレスポンスを返す
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      // ネットワークエラーの場合
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new NetworkError()
      }
      // その他のエラーはそのまま投げる
      throw error
    }
  }

  // 便利メソッド
  get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }

  patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers })
  }

  delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}

export const apiClient = new AuthenticatedApiClient()