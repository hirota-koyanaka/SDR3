import { apiClient } from '../auth-client'

export interface UserProfile {
  id: string
  auth_id: string
  email: string
  name?: string
  phone?: string
  address?: string
  city_resident: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name?: string
  phone?: string
  address?: string
  city_resident?: boolean
}

export interface UpdateUserRequest {
  name?: string
  phone?: string
  address?: string
}

class UserService {
  // 現在のユーザー情報を取得
  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/api/v1/users/me')
  }

  // ユーザー情報を更新
  async updateCurrentUser(data: UpdateUserRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/api/v1/users/me', data)
  }

  // ユーザーを作成（初回登録時）
  async createUser(data: CreateUserRequest): Promise<UserProfile> {
    return apiClient.post<UserProfile>('/api/v1/users', data)
  }

  // ユーザーの犬一覧を取得
  async getUserDogs(userId?: string): Promise<any[]> {
    const endpoint = userId ? `/api/v1/users/${userId}/dogs` : '/api/v1/users/me/dogs'
    return apiClient.get<any[]>(endpoint)
  }

  // ユーザーの投稿一覧を取得
  async getUserPosts(userId?: string): Promise<any[]> {
    const endpoint = userId ? `/api/v1/users/${userId}/posts` : '/api/v1/users/me/posts'
    return apiClient.get<any[]>(endpoint)
  }

  // ユーザーの通知一覧を取得
  async getNotifications(): Promise<any[]> {
    return apiClient.get<any[]>('/api/v1/users/me/notifications')
  }

  // 通知を既読にする
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiClient.patch(`/api/v1/users/me/notifications/${notificationId}`, { is_read: true })
  }

  // 全ての通知を既読にする
  async markAllNotificationsAsRead(): Promise<void> {
    return apiClient.post('/api/v1/users/me/notifications/read-all')
  }
}

export const userService = new UserService()