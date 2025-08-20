'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterCompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            申請を受け付けました
          </h1>
          
          <p className="text-gray-600 mb-6">
            ご登録いただいたメールアドレスに確認メールを送信しました。
            メール内のリンクをクリックして、メールアドレスの確認を完了してください。
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              申請内容は管理者が確認後、承認されます。
              承認完了までしばらくお待ちください。
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">
                ログインページへ
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                ホームへ戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}