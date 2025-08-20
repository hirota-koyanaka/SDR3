'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ApplicationDetailModal } from '../modals/ApplicationDetailModal'

interface Application {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  is_imabari_resident: boolean
  status: 'pending' | 'approved' | 'rejected'
  address: string
  dogs?: any[]
  vaccination_certificates?: any[]
  rejected_reason?: string
}

interface ApplicationsTableProps {
  applications: Application[]
  onStatusChange: () => void
}

export function ApplicationsTable({ applications, onStatusChange }: ApplicationsTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

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
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請者名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                今治市民
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  申請データがありません
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(application.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {application.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.is_imabari_resident ? '○' : '×'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(application)}
                    >
                      詳細
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={() => {
            setSelectedApplication(null)
            onStatusChange()
          }}
        />
      )}
    </>
  )
}