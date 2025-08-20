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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Upload, Loader2, Dog } from 'lucide-react'
import Image from 'next/image'

const dogSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  breed: z.string().min(1, '犬種を入力してください'),
  weight: z.number().min(0.1, '体重を入力してください'),
  gender: z.enum(['male', 'female'], { required_error: '性別を選択してください' }),
  birth_date: z.string().optional(),
  is_neutered: z.boolean().optional(),
  personality: z.string().max(500, '性格・特記事項は500文字以内で入力してください').optional(),
})

type DogForm = z.infer<typeof dogSchema>

export default function NewDogPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DogForm>({
    resolver: zodResolver(dogSchema),
  })
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const onSubmit = async (data: DogForm) => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('breed', data.breed)
      formData.append('weight', data.weight.toString())
      formData.append('gender', data.gender)
      if (data.birth_date) formData.append('birth_date', data.birth_date)
      if (data.is_neutered !== undefined) formData.append('is_neutered', data.is_neutered.toString())
      if (data.personality) formData.append('personality', data.personality)
      if (photoFile) formData.append('photo', photoFile)
      
      const response = await fetch('/api/v1/dogs', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        toast.success('犬を登録しました')
        router.push('/dogs')
      } else {
        throw new Error('登録に失敗しました')
      }
    } catch (error) {
      toast.error('犬の登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">犬を登録</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 写真 */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Photo preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Dog size={48} className="text-gray-400" />
                )}
              </div>
              <label className="absolute inset-0 w-32 h-32 rounded-lg bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              クリックして写真を追加
            </p>
          </div>
          
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                名前 <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('name')}
                id="name"
                placeholder="ポチ"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="breed">
                犬種 <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('breed')}
                id="breed"
                placeholder="柴犬"
                className="mt-1"
              />
              {errors.breed && (
                <p className="text-red-500 text-sm mt-1">{errors.breed.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="weight">
                体重（kg） <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.1"
                {...register('weight', { valueAsNumber: true })}
                id="weight"
                placeholder="12.5"
                className="mt-1"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="gender">
                性別 <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                <SelectTrigger id="gender" className="mt-1">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">オス</SelectItem>
                  <SelectItem value="female">メス</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="birth_date">生年月日</Label>
              <Input
                type="date"
                {...register('birth_date')}
                id="birth_date"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="is_neutered">去勢・避妊</Label>
              <Select onValueChange={(value) => setValue('is_neutered', value === 'true')}>
                <SelectTrigger id="is_neutered" className="mt-1">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">済み</SelectItem>
                  <SelectItem value="false">未実施</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="personality">性格・特記事項</Label>
            <Textarea
              {...register('personality')}
              id="personality"
              rows={4}
              placeholder="例：人懐っこい、他の犬が苦手、など"
              className="mt-1"
            />
            {errors.personality && (
              <p className="text-red-500 text-sm mt-1">{errors.personality.message}</p>
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
                  登録中...
                </>
              ) : (
                '登録する'
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