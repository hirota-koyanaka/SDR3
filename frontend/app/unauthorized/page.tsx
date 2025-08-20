import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, LogIn } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            アクセス権限がありません
          </h1>
          
          <p className="text-gray-600 mb-6">
            このページを表示するには管理者権限が必要です。
            管理者アカウントでログインしてください。
          </p>
          
          <div className="space-y-3">
            <Link href="/admin/login" className="block">
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                管理者ログインへ
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                ホームへ戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}