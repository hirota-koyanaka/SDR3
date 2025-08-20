'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Application {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  is_imabari_resident: boolean
}

interface RecentApplicationsProps {
  applications: Application[]
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  const getStatusBadge = (status: Application['status']) => {
    const statusMap = {
      pending: { label: '承認待ち', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '承認済み', className: 'bg-green-100 text-green-800' },
      rejected: { label: '却下', className: 'bg-red-100 text-red-800' },
    }
    const { label, className } = statusMap[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の申請</h2>
          <Link href="/admin/applications">
            <Button variant="ghost" size="sm">
              すべて見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {applications.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            申請がありません
          </div>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {application.name}
                    </p>
                    {application.is_imabari_resident && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        今治市民
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{application.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(application.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                  <Link href={`/admin/applications/${application.id}`}>
                    <Button variant="outline" size="sm">
                      詳細
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}