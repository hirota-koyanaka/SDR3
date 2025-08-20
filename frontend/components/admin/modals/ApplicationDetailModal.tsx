'use client'

import { useState } from 'react'
import { applicationService } from '@/lib/api/services/application-service'
import { withErrorHandling } from '@/lib/error-handler'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { User, Phone, Mail, MapPin, Dog, FileText, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ApplicationDetailModalProps {
  application: any
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onStatusChange,
}: ApplicationDetailModalProps) {
  const [adminMemo, setAdminMemo] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    
    const result = await withErrorHandling(async () => {
      const response = await applicationService.approveApplication(application.id)
      toast.success('申請を承認しました')
      onStatusChange()
      onClose()
      return response
    })
    
    setIsProcessing(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('却下理由を入力してください')
      return
    }
    
    setIsProcessing(true)
    
    const result = await withErrorHandling(async () => {
      const response = await applicationService.rejectApplication(application.id, rejectReason)
      toast.success('申請を却下しました')
      onStatusChange()
      onClose()
      return response
    })
    
    setIsProcessing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>申請詳細</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="dog">犬情報</TabsTrigger>
            <TabsTrigger value="documents">提出書類</TabsTrigger>
            <TabsTrigger value="action">処理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  氏名
                </div>
                <p className="font-medium">{application.name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  メールアドレス
                </div>
                <p className="font-medium">{application.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  電話番号
                </div>
                <p className="font-medium">{application.phone}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  今治市民
                </div>
                <p className="font-medium">
                  {application.is_imabari_resident ? (
                    <span className="text-green-600">○ 今治市民</span>
                  ) : (
                    <span className="text-gray-600">× 市外居住者</span>
                  )}
                </p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  住所
                </div>
                <p className="font-medium">{application.address}</p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <div className="text-sm text-gray-500">申請日時</div>
                <p className="font-medium">
                  {format(new Date(application.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dog" className="space-y-4 mt-4">
            {application.dogs && application.dogs.length > 0 ? (
              application.dogs.map((dog: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Dog className="h-5 w-5 mr-2 text-gray-600" />
                    <h4 className="font-semibold">犬 {index + 1}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">名前</span>
                      <p className="font-medium">{dog.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">犬種</span>
                      <p className="font-medium">{dog.breed}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">体重</span>
                      <p className="font-medium">{dog.weight}kg</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">性別</span>
                      <p className="font-medium">{dog.gender === 'male' ? 'オス' : 'メス'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">犬の登録情報がありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div>
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                <h4 className="font-semibold">ワクチン接種証明書</h4>
              </div>
              {application.vaccination_certificates && application.vaccination_certificates.length > 0 ? (
                <div className="space-y-2">
                  {application.vaccination_certificates.map((cert: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        証明書 {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">証明書が提出されていません</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="action" className="space-y-4 mt-4">
            {application.status === 'pending' && (
              <>
                <div>
                  <label className="text-sm font-medium">管理者メモ（任意）</label>
                  <Textarea
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="管理者用のメモを入力"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      承認する
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="却下理由を入力"
                      className="h-20"
                    />
                    <Button
                      onClick={handleReject}
                      disabled={isProcessing || !rejectReason.trim()}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      却下する
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {application.status === 'approved' && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-600 font-medium">この申請は承認済みです</p>
                {application.reviewed_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    承認日時: {format(new Date(application.reviewed_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                )}
              </div>
            )}
            
            {application.status === 'rejected' && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium">この申請は却下されました</p>
                {application.rejected_reason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">却下理由:</p>
                    <p className="text-sm text-red-700 mt-1">{application.rejected_reason}</p>
                  </div>
                )}
                {application.reviewed_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    却下日時: {format(new Date(application.reviewed_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}