import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private baseURL: string
  private supabase = createClient()

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session?.access_token || null
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options
    
    // URLパラメータの処理
    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    // 認証トークンの追加
    const token = await this.getAuthToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }))
        throw new Error(error.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // GET リクエスト
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  // POST リクエスト
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT リクエスト
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE リクエスト
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH リクエスト
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

// 管理者API用のヘルパー関数
export const adminApi = {
  // 申請管理
  applications: {
    list: (params?: Record<string, string>) => 
      apiClient.get('/admin/applications', params),
    get: (id: string) => 
      apiClient.get(`/admin/applications/${id}`),
    approve: (id: string, data?: any) => 
      apiClient.put(`/admin/applications/${id}/approve`, data),
    reject: (id: string, data: { reason: string }) => 
      apiClient.put(`/admin/applications/${id}/reject`, data),
  },

  // ユーザー管理
  users: {
    list: (params?: Record<string, string>) => 
      apiClient.get('/admin/users', params),
    get: (id: string) => 
      apiClient.get(`/admin/users/${id}`),
    update: (id: string, data: any) => 
      apiClient.put(`/admin/users/${id}`, data),
    suspend: (id: string) => 
      apiClient.put(`/admin/users/${id}/suspend`),
    activate: (id: string) => 
      apiClient.put(`/admin/users/${id}/activate`),
  },

  // イベント管理
  events: {
    list: () => 
      apiClient.get('/admin/events'),
    get: (id: string) => 
      apiClient.get(`/admin/events/${id}`),
    create: (data: any) => 
      apiClient.post('/admin/events', data),
    update: (id: string, data: any) => 
      apiClient.put(`/admin/events/${id}`, data),
    delete: (id: string) => 
      apiClient.delete(`/admin/events/${id}`),
  },

  // 投稿管理
  posts: {
    list: (params?: Record<string, string>) => 
      apiClient.get('/admin/posts', params),
    get: (id: string) => 
      apiClient.get(`/admin/posts/${id}`),
    approve: (id: string) => 
      apiClient.put(`/admin/posts/${id}/approve`),
    reject: (id: string, data: { reason: string }) => 
      apiClient.put(`/admin/posts/${id}/reject`, data),
    delete: (id: string) => 
      apiClient.delete(`/admin/posts/${id}`),
  },

  // 入退場管理
  entries: {
    checkIn: (data: { qr_token: string }) => 
      apiClient.post('/admin/entries/check-in', data),
    checkOut: (id: string) => 
      apiClient.put(`/admin/entries/${id}/check-out`),
    list: (params?: Record<string, string>) => 
      apiClient.get('/admin/entries', params),
  },

  // お知らせ管理
  announcements: {
    list: () => 
      apiClient.get('/admin/announcements'),
    get: (id: string) => 
      apiClient.get(`/admin/announcements/${id}`),
    create: (data: any) => 
      apiClient.post('/admin/announcements', data),
    update: (id: string, data: any) => 
      apiClient.put(`/admin/announcements/${id}`, data),
    delete: (id: string) => 
      apiClient.delete(`/admin/announcements/${id}`),
  },

  // レポート
  reports: {
    overview: (params: Record<string, string>) => 
      apiClient.get('/admin/reports/overview', params),
    users: (params: Record<string, string>) => 
      apiClient.get('/admin/reports/users', params),
    entries: (params: Record<string, string>) => 
      apiClient.get('/admin/reports/entries', params),
    events: (params: Record<string, string>) => 
      apiClient.get('/admin/reports/events', params),
    export: (params: Record<string, string>) => 
      apiClient.get('/admin/reports/export', params),
  },

  // システム設定
  settings: {
    businessHours: {
      get: () => apiClient.get('/admin/business-hours'),
      update: (data: any) => apiClient.put('/admin/business-hours', data),
    },
    holidays: {
      list: () => apiClient.get('/admin/holidays'),
      create: (data: any) => apiClient.post('/admin/holidays', data),
      delete: (id: string) => apiClient.delete(`/admin/holidays/${id}`),
    },
    system: {
      get: () => apiClient.get('/admin/system-config'),
      update: (data: any) => apiClient.put('/admin/system-config', data),
    },
  },

  // ダッシュボード
  dashboard: {
    stats: () => apiClient.get('/admin/dashboard/stats'),
    recentActivity: () => apiClient.get('/admin/dashboard/recent-activity'),
  },
}