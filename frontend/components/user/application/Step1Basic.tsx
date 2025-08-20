'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const step1Schema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
  emergency_contact: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
})

type Step1Form = z.infer<typeof step1Schema>

interface Step1Props {
  data: any
  onNext: (data: Step1Form) => void
}

export function ApplicationStep1({ data, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">基本情報</h2>
        <p className="text-gray-600 mb-6">
          お申込みいただく方の基本情報を入力してください。
        </p>
      </div>

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
        <Label htmlFor="email">
          メールアドレス <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder="your@email.com"
          className="mt-1"
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
          className="mt-1"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="emergency_contact">
          緊急連絡先 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('emergency_contact')}
          id="emergency_contact"
          type="tel"
          placeholder="09012345678"
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          緊急時に連絡可能な電話番号を入力してください
        </p>
        {errors.emergency_contact && (
          <p className="text-red-500 text-sm mt-1">{errors.emergency_contact.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          次へ
        </Button>
      </div>
    </form>
  )
}