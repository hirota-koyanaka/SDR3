'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { User, Mail, Phone, MapPin, Dog, Calendar, Activity, Ban, CheckCircle } from 'lucide-react'

interface UserDetailModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: UserDetailModalProps) {
  const [adminNote, setAdminNote] = useState(user.admin_note || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const handleSuspend = async () => {
    if (!confirm('このユーザーを停止しますか？')) return
    
    setIsProcessing(true)
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'suspended',
        suspended_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (!error) {
      alert('ユーザーを停止しました')
      onUpdate()
    } else {
      alert('処理に失敗しました')
    }
    setIsProcessing(false)
  }

  const handleActivate = async () => {
    setIsProcessing(true)
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'active',
        suspended_at: null
      })
      .eq('id', user.id)
    
    if (!error) {
      alert('ユーザーを有効化しました')
      onUpdate()
    } else {
      alert('処理に失敗しました')
    }
    setIsProcessing(false)
  }

  const handleSaveNote = async () => {
    setIsProcessing(true)
    const { error } = await supabase
      .from('users')
      .update({ admin_note: adminNote })
      .eq('id', user.id)
    
    if (!error) {
      alert('メモを保存しました')
    } else {
      alert('保存に失敗しました')
    }
    setIsProcessing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ユーザー詳細</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="dogs">犬情報</TabsTrigger>
            <TabsTrigger value="activity">利用履歴</TabsTrigger>
            <TabsTrigger value="admin">管理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  氏名
                </div>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  メールアドレス
                </div>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  電話番号
                </div>
                <p className="font-medium">{user.phone || '未登録'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  居住地
                </div>
                <p className="font-medium">
                  {user.is_imabari_resident ? (
                    <span className="text-green-600">今治市民</span>
                  ) : (
                    <span className="text-gray-600">市外居住者</span>
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  登録日
                </div>
                <p className="font-medium">
                  {format(new Date(user.created_at), 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Activity className="h-4 w-4 mr-2" />
                  ステータス
                </div>
                <p className="font-medium">
                  {user.status === 'active' ? (
                    <span className="text-green-600">アクティブ</span>
                  ) : (
                    <span className="text-red-600">停止中</span>
                  )}
                </p>
              </div>
              
              {user.address && (
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    住所
                  </div>
                  <p className="font-medium">{user.address}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="dogs" className="space-y-4 mt-4">
            {user.dogs && user.dogs.length > 0 ? (
              user.dogs.map((dog: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Dog className="h-5 w-5 mr-2 text-gray-600" />
                    <h4 className="font-semibold">{dog.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <span className="text-sm text-gray-500">登録日</span>
                      <p className="font-medium">
                        {format(new Date(dog.created_at), 'yyyy/MM/dd', { locale: ja })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">犬の登録情報がありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">利用統計</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">総利用回数</span>
                    <p className="font-bold text-lg">0回</p>
                  </div>
                  <div>
                    <span className="text-gray-500">今月の利用</span>
                    <p className="font-bold text-lg">0回</p>
                  </div>
                  <div>
                    <span className="text-gray-500">最終利用日</span>
                    <p className="font-bold text-lg">-</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">最近の利用履歴</h4>
                <p className="text-center text-gray-500 py-4">利用履歴はありません</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">管理者メモ</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ユーザーに関するメモを入力"
                  className="mt-1"
                  rows={4}
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={isProcessing}
                  size="sm"
                  className="mt-2"
                >
                  メモを保存
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">アカウント操作</h4>
                <div className="flex gap-3">
                  {user.status === 'active' ? (
                    <Button
                      onClick={handleSuspend}
                      disabled={isProcessing}
                      variant="destructive"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      アカウントを停止
                    </Button>
                  ) : (
                    <Button
                      onClick={handleActivate}
                      disabled={isProcessing}
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      アカウントを有効化
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}