'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle } from 'lucide-react'

const step2Schema = z.object({
  postal_code: z.string().regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください'),
  prefecture: z.string().min(1, '都道府県を入力してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  address: z.string().min(1, '番地を入力してください'),
  building: z.string().optional(),
  is_imabari_resident: z.enum(['true', 'false']),
  residence_years: z.string().optional(),
})

type Step2Form = z.infer<typeof step2Schema>

interface Step2Props {
  data: any
  onNext: (data: any) => void
  onBack: () => void
}

export function ApplicationStep2({ data, onNext, onBack }: Step2Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ...data,
      is_imabari_resident: data.is_imabari_resident ? 'true' : 'false',
    },
  })

  const isImabariResident = watch('is_imabari_resident')

  const onSubmit = (formData: Step2Form) => {
    onNext({
      ...formData,
      is_imabari_resident: formData.is_imabari_resident === 'true',
      residence_years: formData.residence_years ? parseInt(formData.residence_years) : 0,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">住所確認</h2>
        <p className="text-gray-600 mb-6">
          今治市在住の方のみご利用いただけます。住所をご確認ください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="postal_code">
            郵便番号 <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('postal_code')}
            id="postal_code"
            placeholder="794-0000"
            className="mt-1"
          />
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="prefecture">
            都道府県 <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('prefecture')}
            id="prefecture"
            placeholder="愛媛県"
            className="mt-1"
          />
          {errors.prefecture && (
            <p className="text-red-500 text-sm mt-1">{errors.prefecture.message}</p>
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
            className="mt-1"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">
            番地 <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('address')}
            id="address"
            placeholder="○○町1-2-3"
            className="mt-1"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="building">建物名・部屋番号</Label>
          <Input
            {...register('building')}
            id="building"
            placeholder="○○マンション 101号室"
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>今治市在住ですか？ <span className="text-red-500">*</span></Label>
        <RadioGroup
          value={isImabariResident}
          onValueChange={(value) => {
            const event = {
              target: { name: 'is_imabari_resident', value }
            }
            register('is_imabari_resident').onChange(event)
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="resident-yes" />
            <Label htmlFor="resident-yes">はい、今治市在住です</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="resident-no" />
            <Label htmlFor="resident-no">いいえ、今治市外在住です</Label>
          </div>
        </RadioGroup>

        {isImabariResident === 'true' && (
          <div>
            <Label htmlFor="residence_years">今治市での居住年数</Label>
            <Input
              {...register('residence_years')}
              id="residence_years"
              type="number"
              placeholder="5"
              className="mt-1 w-32"
              min="0"
            />
            <span className="ml-2">年</span>
          </div>
        )}

        {isImabariResident === 'false' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={20} />
              <div>
                <p className="text-yellow-800 font-semibold">ご注意</p>
                <p className="text-yellow-700 text-sm mt-1">
                  里山ドッグランは今治市在住の方のみご利用いただけます。
                  今治市外にお住まいの方は、申請をお受けできません。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          戻る
        </Button>
        <Button 
          type="submit" 
          size="lg"
          disabled={isImabariResident === 'false'}
        >
          次へ
        </Button>
      </div>
    </form>
  )
}