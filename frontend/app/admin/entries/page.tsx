'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CurrentVisitorsList } from '@/components/admin/entries/CurrentVisitorsList'
import { EntryHistory } from '@/components/admin/entries/EntryHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrCode, Users, DoorOpen, Search } from 'lucide-react'

export default function EntriesPage() {
  const [currentVisitors, setCurrentVisitors] = useState<any[]>([])
  const [qrCode, setQrCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  // リアルタイム更新の設定
  useEffect(() => {
    const channel = supabase
      .channel('entry-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entry_logs',
        },
        () => {
          fetchCurrentVisitors()
        }
      )
      .subscribe()
    
    fetchCurrentVisitors()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCurrentVisitors = async () => {
    const { data } = await supabase
      .from('entry_logs')
      .select('*, users(name, email), dogs(name, breed)')
      .is('exit_time', null)
      .order('entry_time', { ascending: false })
    
    setCurrentVisitors(data || [])
  }

  const handleQrScan = async () => {
    if (!qrCode.trim()) {
      alert('QRコードを入力してください')
      return
    }

    setIsProcessing(true)
    
    // ユーザーIDをQRコードから取得（実際の実装では適切な形式で）
    const userId = qrCode
    
    // 現在入場中かチェック
    const { data: existingEntry } = await supabase
      .from('entry_logs')
      .select('*')
      .eq('user_id', userId)
      .is('exit_time', null)
      .single()
    
    if (existingEntry) {
      // 退場処理
      const { error } = await supabase
        .from('entry_logs')
        .update({ exit_time: new Date().toISOString() })
        .eq('id', existingEntry.id)
      
      if (!error) {
        alert('退場処理が完了しました')
        setQrCode('')
        fetchCurrentVisitors()
      } else {
        alert('退場処理に失敗しました')
      }
    } else {
      // 入場処理
      const { error } = await supabase
        .from('entry_logs')
        .insert([{
          user_id: userId,
          entry_time: new Date().toISOString(),
        }])
      
      if (!error) {
        alert('入場処理が完了しました')
        setQrCode('')
        fetchCurrentVisitors()
      } else {
        alert('入場処理に失敗しました')
      }
    }
    
    setIsProcessing(false)
  }

  const handleCheckOut = async (entryId: string) => {
    const { error } = await supabase
      .from('entry_logs')
      .update({ exit_time: new Date().toISOString() })
      .eq('id', entryId)
    
    if (!error) {
      alert('退場処理が完了しました')
      fetchCurrentVisitors()
    } else {
      alert('退場処理に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入退場管理</h1>
          <p className="text-gray-600 mt-1">利用者の入退場を管理します</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-600">現在の利用者</span>
              <span className="text-2xl font-bold text-blue-900">{currentVisitors.length}</span>
              <span className="text-sm text-blue-600">組</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <QrCode className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="font-semibold">QRコード入力</h2>
        </div>
        
        <div className="flex gap-3">
          <Input
            placeholder="QRコードまたはユーザーIDを入力"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQrScan()}
            className="flex-1"
          />
          <Button
            onClick={handleQrScan}
            disabled={isProcessing || !qrCode.trim()}
          >
            <DoorOpen className="h-4 w-4 mr-2" />
            入退場処理
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          QRコードをスキャンまたは手動入力して、入退場処理を行います
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">現在の利用者</TabsTrigger>
          <TabsTrigger value="history">入退場履歴</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="名前で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-sm"
                />
              </div>
            </div>
            <CurrentVisitorsList
              visitors={currentVisitors.filter(v => 
                !searchTerm || 
                v.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onCheckOut={handleCheckOut}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <EntryHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}