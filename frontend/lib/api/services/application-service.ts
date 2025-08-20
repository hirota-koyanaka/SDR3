import { apiClient } from '../auth-client'

export interface Application {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  address: string
  postal_code: string
  city_resident: boolean
  dogs: DogInfo[]
  residence_proof_url?: string
  status: 'pending' | 'approved' | 'rejected'
  applied_at: string
  reviewed_at?: string
  reviewer_id?: string
  rejection_reason?: string
}

export interface DogInfo {
  name: string
  breed: string
  gender: 'male' | 'female'
  age: number
  weight: number
  neutered: boolean
  vaccine_certificate_url?: string
  rabies_vaccine_date?: string
  mixed_vaccine_date?: string
  microchip_number?: string
}

export interface CreateApplicationRequest {
  name: string
  email: string
  phone: string
  address: string
  postal_code: string
  city_resident: boolean
  dogs: DogInfo[]
  residence_proof?: File
}

class ApplicationService {
  // 申請を作成
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const formData = new FormData()
    
    // 基本情報を追加
    Object.keys(data).forEach(key => {
      if (key === 'dogs') {
        formData.append('dogs', JSON.stringify(data.dogs))
      } else if (key === 'residence_proof' && data.residence_proof) {
        formData.append('residence_proof', data.residence_proof)
      } else {
        formData.append(key, String(data[key as keyof CreateApplicationRequest]))
      }
    })

    // FormDataを送信する場合はContent-Typeを設定しない（ブラウザが自動設定）
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/applications`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // 自分の申請状況を取得
  async getMyApplication(): Promise<Application | null> {
    try {
      return await apiClient.get<Application>('/api/v1/applications/me')
    } catch (error) {
      return null
    }
  }

  // 申請一覧を取得（管理者用）
  async getApplications(status?: string): Promise<Application[]> {
    const query = status ? `?status=${status}` : ''
    return apiClient.get<Application[]>(`/api/v1/applications${query}`)
  }

  // 申請詳細を取得（管理者用）
  async getApplication(id: string): Promise<Application> {
    return apiClient.get<Application>(`/api/v1/applications/${id}`)
  }

  // 申請を承認（管理者用）
  async approveApplication(id: string): Promise<Application> {
    return apiClient.post<Application>(`/api/v1/applications/${id}/approve`)
  }

  // 申請を却下（管理者用）
  async rejectApplication(id: string, reason: string): Promise<Application> {
    return apiClient.post<Application>(`/api/v1/applications/${id}/reject`, { reason })
  }

  private async getToken(): Promise<string> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }
}

export const applicationService = new ApplicationService()