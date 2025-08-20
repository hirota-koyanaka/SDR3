'use client'

import { useState, useEffect } from 'react'
import { applicationService } from '@/lib/api/services/application-service'
import { withErrorHandling } from '@/lib/error-handler'
import { ApplicationsTable } from '@/components/admin/tables/ApplicationsTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function ApplicationsPage() {
  const [status, setStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchApplications = async () => {
    setIsLoading(true)
    
    const result = await withErrorHandling(async () => {
      const statusParam = status === 'all' ? undefined : status
      const data = await applicationService.getApplications(statusParam)
      
      // クライアント側でフィルタリング
      if (searchTerm) {
        return data.filter(app => 
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      return data
    })
    
    if (result) {
      setApplications(result)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [status, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">申請管理</h1>
          <p className="text-gray-600 mt-1">ユーザーからの申請を確認・承認します</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="名前やメールで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>
      
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下</TabsTrigger>
        </TabsList>
        
        <TabsContent value={status} className="mt-4">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              読み込み中...
            </div>
          ) : (
            <ApplicationsTable 
              applications={applications} 
              onStatusChange={fetchApplications}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}