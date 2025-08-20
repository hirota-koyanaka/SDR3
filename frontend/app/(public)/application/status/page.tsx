'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ApplicationStatusPage() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`http://localhost:8000/api/v1/applications/${applicationId}`)
        if (response.ok) {
          const data = await response.json()
          setApplication({
            id: data.id,
            status: data.status || 'pending',
            submitted_at: data.created_at || new Date().toISOString(),
            applicant_name: data.name || '名前なし',
            email: data.email,
            phone: data.phone,
            address: data.address,
            dogs: data.dogs || [],
            message: data.message || '',
          })
        } else {
          throw new Error('申請情報の取得に失敗しました')
        }
      } catch (error) {
        console.error('Error fetching application:', error)
        toast.error('申請情報の取得に失敗しました')
        // エラー時はデフォルト値を設定
        setApplication({
          id: applicationId,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          applicant_name: '読み込みエラー',
          message: '',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplication()
  }, [applicationId])
  
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
      title: '審査中',
      message: '申請を受付けました。審査完了までしばらくお待ちください。',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      title: '承認済み',
      message: 'おめでとうございます！申請が承認されました。ドッグランをご利用いただけます。',
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
      title: '却下',
      message: '申し訳ございません。申請は却下されました。詳細はメールをご確認ください。',
    },
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">申請情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
              <p className="mt-4 text-gray-600">申請情報が見つかりません</p>
              <Link href="/" className="mt-4 inline-block">
                <Button>ホームに戻る</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const status = statusConfig[application.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`p-6 ${status.color}`}>
            <div className="flex items-center">
              <StatusIcon size={32} className="mr-3" />
              <div>
                <h1 className="text-2xl font-bold">{status.title}</h1>
                <p className="text-sm opacity-80 mt-1">
                  申請ID: {applicationId}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700">{status.message}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold mb-3">申請情報</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-32 text-gray-600">申請者:</dt>
                  <dd className="font-medium">{application.applicant_name}</dd>
                </div>
                {application.email && (
                  <div className="flex">
                    <dt className="w-32 text-gray-600">メール:</dt>
                    <dd className="font-medium">{application.email}</dd>
                  </div>
                )}
                {application.phone && (
                  <div className="flex">
                    <dt className="w-32 text-gray-600">電話番号:</dt>
                    <dd className="font-medium">{application.phone}</dd>
                  </div>
                )}
                {application.address && (
                  <div className="flex">
                    <dt className="w-32 text-gray-600">住所:</dt>
                    <dd className="font-medium">{application.address}</dd>
                  </div>
                )}
                <div className="flex">
                  <dt className="w-32 text-gray-600">申請日時:</dt>
                  <dd className="font-medium">
                    {new Date(application.submitted_at).toLocaleString('ja-JP')}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">ステータス:</dt>
                  <dd className="font-medium">{status.title}</dd>
                </div>
                {application.dogs && application.dogs.length > 0 && (
                  <div className="flex">
                    <dt className="w-32 text-gray-600">登録犬数:</dt>
                    <dd className="font-medium">{application.dogs.length}頭</dd>
                  </div>
                )}
              </dl>
            </div>
            
            {application.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-blue-800 font-semibold">審査について</p>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>審査には通常3営業日程度かかります</li>
                      <li>審査結果はメールでお知らせします</li>
                      <li>追加書類が必要な場合はご連絡することがあります</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {application.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mt-0.5 mr-2 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-green-800 font-semibold">次のステップ</p>
                    <ol className="text-green-700 text-sm mt-2 space-y-1 list-decimal list-inside">
                      <li>マイページにログインしてください</li>
                      <li>犬情報を登録してください</li>
                      <li>QRコードを生成して入場時に提示してください</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  ホームに戻る
                </Button>
              </Link>
              {application.status === 'approved' && (
                <Link href="/login" className="flex-1">
                  <Button className="w-full">
                    ログインする
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}