'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, validateFile } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  confirmPassword: z.string(),
  name: z.string().min(1, '名前を入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  dogName: z.string().min(1, '愛犬の名前を入力してください'),
  dogBreed: z.string().min(1, '犬種を入力してください'),
  dogAge: z.string().min(1, '年齢を入力してください'),
  dogGender: z.enum(['オス', 'メス']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [vaccinationFile, setVaccinationFile] = useState<File | null>(null)
  const [rabiesFile, setRabiesFile] = useState<File | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      city: '今治市'
    }
  })
  
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    
    try {
      // Supabase Authでユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      })
      
      if (authError) {
        toast.error('登録に失敗しました: ' + authError.message)
        setIsLoading(false)
        return
      }
      
      if (!authData.user) {
        toast.error('ユーザー情報の取得に失敗しました')
        setIsLoading(false)
        return
      }
      
      // ワクチン証明書をアップロード
      let vaccinationUrl = null
      if (vaccinationFile) {
        const validation = validateFile(vaccinationFile)
        if (!validation.valid) {
          toast.error(`ワクチン証明書: ${validation.error}`)
          setIsLoading(false)
          return
        }
        
        const { url, error: uploadError } = await uploadFile(vaccinationFile, 'vaccination')
        if (uploadError) {
          toast.error('ワクチン証明書のアップロードに失敗しました')
          setIsLoading(false)
          return
        }
        vaccinationUrl = url
      }
      
      // 狂犬病予防接種証明書をアップロード
      let rabiesUrl = null
      if (rabiesFile) {
        const validation = validateFile(rabiesFile)
        if (!validation.valid) {
          toast.error(`狂犬病予防接種証明書: ${validation.error}`)
          setIsLoading(false)
          return
        }
        
        const { url, error: uploadError } = await uploadFile(rabiesFile, 'rabies')
        if (uploadError) {
          toast.error('狂犬病予防接種証明書のアップロードに失敗しました')
          setIsLoading(false)
          return
        }
        rabiesUrl = url
      }
      
      // 申請データを作成
      const applicationData = {
        user_id: authData.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postal_code: data.postalCode,
        city: data.city,
        dog_name: data.dogName,
        dog_breed: data.dogBreed,
        dog_age: parseInt(data.dogAge),
        dog_gender: data.dogGender,
        vaccination_certificate_url: vaccinationUrl,
        rabies_certificate_url: rabiesUrl,
        status: 'pending'
      }
      
      // 申請をデータベースに保存
      const { error: applicationError } = await supabase
        .from('applications')
        .insert([applicationData])
      
      if (applicationError) {
        console.error('Application error:', applicationError)
        toast.error('申請の送信に失敗しました')
        setIsLoading(false)
        return
      }
      
      toast.success('申請を受け付けました。承認までお待ちください。')
      toast.success('確認メールを送信しました。メールをご確認ください。', {
        duration: 5000,
      })
      
      router.push('/register/complete')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFileChange = (type: 'vaccination' | 'rabies') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'vaccination') {
        setVaccinationFile(file)
      } else {
        setRabiesFile(file)
      }
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
            <p className="text-gray-600 mt-2">
              里山ドッグランの利用申請
            </p>
            <p className="text-sm text-red-600 mt-2">
              ※ 今治市民の方のみご利用いただけます
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 利用者情報 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">利用者情報</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="山田 太郎"
                    className="w-full mt-1"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
            
                <div>
                  <Label htmlFor="email">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full mt-1"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                    className="w-full mt-1"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password">
                    パスワード <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('password')}
                    id="password"
                    type="password"
                    placeholder="8文字以上"
                    className="w-full mt-1"
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">
                    パスワード（確認） <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    type="password"
                    placeholder="パスワードを再入力"
                    className="w-full mt-1"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="postalCode">
                    郵便番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('postalCode')}
                    id="postalCode"
                    placeholder="794-0000"
                    className="w-full mt-1"
                    autoComplete="postal-code"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city">
                    市区町村 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('city')}
                    id="city"
                    placeholder="今治市"
                    className="w-full mt-1"
                    autoComplete="address-level2"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="address">
                    住所 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('address')}
                    id="address"
                    placeholder="○○町1-2-3"
                    className="w-full mt-1"
                    autoComplete="street-address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 愛犬情報 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">愛犬情報</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dogName">
                    愛犬の名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('dogName')}
                    id="dogName"
                    placeholder="ポチ"
                    className="w-full mt-1"
                  />
                  {errors.dogName && (
                    <p className="text-red-500 text-sm mt-1">{errors.dogName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="dogBreed">
                    犬種 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('dogBreed')}
                    id="dogBreed"
                    placeholder="柴犬"
                    className="w-full mt-1"
                  />
                  {errors.dogBreed && (
                    <p className="text-red-500 text-sm mt-1">{errors.dogBreed.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="dogAge">
                    年齢 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('dogAge')}
                    id="dogAge"
                    type="number"
                    placeholder="3"
                    className="w-full mt-1"
                  />
                  {errors.dogAge && (
                    <p className="text-red-500 text-sm mt-1">{errors.dogAge.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>性別 <span className="text-red-500">*</span></Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        {...register('dogGender')}
                        type="radio"
                        value="オス"
                        className="mr-2"
                      />
                      オス
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('dogGender')}
                        type="radio"
                        value="メス"
                        className="mr-2"
                      />
                      メス
                    </label>
                  </div>
                  {errors.dogGender && (
                    <p className="text-red-500 text-sm mt-1">{errors.dogGender.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="vaccination">混合ワクチン接種証明書</Label>
                  <Input
                    id="vaccination"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange('vaccination')}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ※ 1年以内の接種証明書をアップロードしてください
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="rabies">狂犬病予防接種証明書</Label>
                  <Input
                    id="rabies"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange('rabies')}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ※ 1年以内の接種証明書をアップロードしてください
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2 rounded" required />
              <label className="text-sm text-gray-600">
                <Link href="/terms" className="text-primary hover:underline">
                  利用規約
                </Link>
                および
                <Link href="/privacy" className="text-primary hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                '申請を送信'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              すでにアカウントをお持ちの方は
              <Link href="/login" className="text-primary hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}