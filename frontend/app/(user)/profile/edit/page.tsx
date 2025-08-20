'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'
import { User, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

const profileSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
  bio: z.string().max(500, '自己紹介は500文字以内で入力してください').optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '山田 太郎', // TODO: 実際のデータから取得
      phone: '09012345678',
      bio: '',
    },
  })
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('phone', data.phone)
      if (data.bio) formData.append('bio', data.bio)
      if (avatarFile) formData.append('avatar', avatarFile)
      
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        body: formData,
      })
      
      if (response.ok) {
        toast.success('プロフィールを更新しました')
        router.push('/profile')
      } else {
        throw new Error('更新に失敗しました')
      }
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* アバター */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <label className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              クリックして写真を変更
            </p>
          </div>
          
          {/* 基本情報 */}
          <div>
            <Label htmlFor="name">
              お名前 <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('name')}
              id="name"
              placeholder="山田 太郎"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">
              電話番号 <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('phone')}
              id="phone"
              type="tel"
              placeholder="09012345678"
              className="mt-1"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              {...register('bio')}
              id="bio"
              rows={4}
              placeholder="愛犬との楽しい時間について書いてみましょう..."
              className="mt-1"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                '更新する'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}