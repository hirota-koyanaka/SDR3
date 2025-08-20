'use client'

import Image from 'next/image'
import { User, Mail, Phone, Calendar, Dog, MessageSquare, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface UserData {
  id?: string
  email?: string
  name: string
  phone: string
  avatar_url?: string | null
  created_at?: string
  dogs_count: number
  posts_count: number
  visits_count: number
}

interface ProfileViewProps {
  userData: UserData
}

export function ProfileView({ userData }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* プロフィール基本情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {userData.avatar_url ? (
                <Image
                  src={userData.avatar_url}
                  alt={userData.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{userData.name}</h2>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                <span className="text-sm">{userData.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">{userData.phone}</span>
              </div>
              
              {userData.created_at && (
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">
                    登録日: {format(new Date(userData.created_at), 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 活動統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Dog className="mx-auto mb-2 text-blue-500" size={32} />
          <p className="text-2xl font-bold text-gray-900">{userData.dogs_count}</p>
          <p className="text-sm text-gray-600">登録犬数</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <MessageSquare className="mx-auto mb-2 text-green-500" size={32} />
          <p className="text-2xl font-bold text-gray-900">{userData.posts_count}</p>
          <p className="text-sm text-gray-600">投稿数</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <MapPin className="mx-auto mb-2 text-orange-500" size={32} />
          <p className="text-2xl font-bold text-gray-900">{userData.visits_count}</p>
          <p className="text-sm text-gray-600">利用回数</p>
        </div>
      </div>
      
      {/* 最近の活動 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">最近の活動</h3>
        <div className="text-center py-8 text-gray-500">
          まだ活動がありません
        </div>
      </div>
    </div>
  )
}