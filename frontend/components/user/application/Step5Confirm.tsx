'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertCircle } from 'lucide-react'

interface Step5Props {
  data: any
  onSubmit: () => void
  onBack: () => void
}

export function ApplicationStep5({ data, onSubmit, onBack }: Step5Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const handleSubmit = async () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください')
      return
    }
    setIsSubmitting(true)
    await onSubmit()
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">申請内容の確認</h2>
      <p className="text-gray-600 mb-6">
        以下の内容で申請を行います。内容をご確認ください。
      </p>
      
      <div className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">基本情報</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="w-32 text-gray-600">お名前:</dt>
              <dd className="font-medium">{data.name}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-gray-600">メールアドレス:</dt>
              <dd className="font-medium">{data.email}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-gray-600">電話番号:</dt>
              <dd className="font-medium">{data.phone}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-gray-600">緊急連絡先:</dt>
              <dd className="font-medium">{data.emergency_contact}</dd>
            </div>
          </dl>
        </div>
        
        {/* 住所情報 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">住所情報</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="w-32 text-gray-600">郵便番号:</dt>
              <dd className="font-medium">{data.postal_code}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-gray-600">住所:</dt>
              <dd className="font-medium">
                {data.prefecture}{data.city}{data.address}
                {data.building && ` ${data.building}`}
              </dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-gray-600">今治市在住:</dt>
              <dd className="font-medium">
                {data.is_imabari_resident ? 'はい' : 'いいえ'}
                {data.is_imabari_resident && data.residence_years && 
                  ` (${data.residence_years}年)`
                }
              </dd>
            </div>
          </dl>
        </div>
        
        {/* 犬情報 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">登録犬情報 ({data.dogs?.length || 0}頭)</h3>
          <div className="space-y-3">
            {data.dogs?.map((dog: any, index: number) => (
              <div key={index} className="bg-white rounded p-3">
                <p className="font-medium mb-1">{index + 1}. {dog.name}</p>
                <dl className="text-sm text-gray-600 grid grid-cols-2 gap-1">
                  <div className="flex">
                    <dt className="mr-2">犬種:</dt>
                    <dd>{dog.breed}</dd>
                  </div>
                  <div className="flex">
                    <dt className="mr-2">体重:</dt>
                    <dd>{dog.weight}kg</dd>
                  </div>
                  <div className="flex">
                    <dt className="mr-2">性別:</dt>
                    <dd>{dog.gender === 'male' ? 'オス' : 'メス'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="mr-2">去勢・避妊:</dt>
                    <dd>{dog.is_neutered ? '済み' : '未実施'}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
        
        {/* アップロード書類 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">アップロード書類</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              ワクチン接種証明書 ({data.vaccination_certificates?.length || 0}ファイル)
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2" size={16} />
              住民票 (1ファイル)
            </li>
          </ul>
        </div>
        
        {/* 利用規約同意 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 mr-3"
            />
            <label htmlFor="terms" className="text-sm">
              <span className="font-semibold text-yellow-800">利用規約への同意</span>
              <p className="text-yellow-700 mt-1">
                里山ドッグランの利用規約を確認し、内容に同意します。
                虚偽の申請を行った場合、利用資格を取り消される場合があることを理解しています。
              </p>
            </label>
          </div>
        </div>
        
        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" size={20} />
            <div>
              <p className="text-blue-800 font-semibold">申請後の流れ</p>
              <ol className="text-blue-700 text-sm mt-2 space-y-1 list-decimal list-inside">
                <li>申請内容を管理者が確認します（通常3営業日以内）</li>
                <li>承認されるとメールで通知が届きます</li>
                <li>承認後、ドッグランをご利用いただけるようになります</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={onBack} 
          size="lg" 
          disabled={isSubmitting}
          type="button"
        >
          戻る
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="lg" 
          disabled={isSubmitting || !agreedToTerms}
          type="button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              申請中...
            </>
          ) : (
            '申請を送信'
          )}
        </Button>
      </div>
    </div>
  )
}