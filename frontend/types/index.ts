// ユーザー関連の型定義
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  is_imabari_resident: boolean
  status: 'active' | 'suspended'
  created_at: string
  updated_at: string
  admin_note?: string
  dogs?: Dog[]
}

export interface AdminUser {
  id: string
  auth_id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  created_at: string
}

// 犬関連の型定義
export interface Dog {
  id: string
  user_id: string
  name: string
  breed: string
  weight: number
  gender: 'male' | 'female'
  birth_date?: string
  vaccination_date?: string
  created_at: string
  updated_at: string
}

// 申請関連の型定義
export interface Application {
  id: string
  name: string
  email: string
  phone: string
  address: string
  is_imabari_resident: boolean
  status: 'pending' | 'approved' | 'rejected'
  dogs?: ApplicationDog[]
  vaccination_certificates?: VaccinationCertificate[]
  admin_memo?: string
  rejected_reason?: string
  created_at: string
  reviewed_at?: string
}

export interface ApplicationDog {
  name: string
  breed: string
  weight: number
  gender: 'male' | 'female'
}

export interface VaccinationCertificate {
  id: string
  url: string
  uploaded_at: string
}

// イベント関連の型定義
export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location?: string
  max_participants?: number
  current_participants?: number
  fee?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  attended: boolean
}

// 投稿関連の型定義
export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  hashtags?: string[]
  status: 'pending' | 'approved' | 'rejected'
  likes_count: number
  comments_count: number
  report_count: number
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
  users?: {
    name: string
    email: string
  }
  reports?: PostReport[]
}

export interface PostReport {
  id: string
  post_id: string
  user_id: string
  reason: string
  description?: string
  created_at: string
}

// 入退場関連の型定義
export interface EntryLog {
  id: string
  user_id: string
  entry_time: string
  exit_time?: string
  dogs?: Dog[]
  users?: {
    name: string
    email: string
  }
}

// お知らせ関連の型定義
export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

// 営業時間関連の型定義
export interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    is_closed: boolean
  }
}

export interface SpecialHoliday {
  id: string
  date: string
  reason: string
  created_at: string
}

// システム設定関連の型定義
export interface SystemConfig {
  max_dogs_per_user: number
  max_simultaneous_users: number
  require_vaccination: boolean
  vaccination_validity_days: number
  allow_guest_viewing: boolean
  enable_sns_features: boolean
  enable_event_registration: boolean
  maintenance_mode: boolean
  maintenance_message?: string
  terms_of_service?: string
  privacy_policy?: string
}

// レポート関連の型定義
export interface DashboardStats {
  totalUsers: number
  pendingApplications: number
  upcomingEvents: number
  currentVisitors: number
}

export interface ReportData {
  date: string
  users: number
  entries: number
  newUsers: number
}

export interface UserAnalytics {
  byCity: Array<{
    name: string
    value: number
    percentage: number
  }>
  byDogCount: Array<{
    count: string
    users: number
  }>
}

export interface EntryAnalytics {
  byHour: Array<{
    hour: string
    entries: number
  }>
  byDayOfWeek: Array<{
    day: string
    entries: number
  }>
}

// API レスポンスの型定義
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// フォームの型定義
export interface LoginForm {
  email: string
  password: string
}

export interface EventForm {
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location?: string
  max_participants?: number
  fee?: number
}

export interface AnnouncementForm {
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  is_published: boolean
}