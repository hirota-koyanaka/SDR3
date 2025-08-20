import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="h-8 w-8 text-gray-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            ページが見つかりません
          </h2>
          
          <p className="text-gray-600 mb-6">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
          
          <div className="space-y-3">
            <Link href="/admin" className="block">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                管理画面トップへ
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              前のページへ戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}