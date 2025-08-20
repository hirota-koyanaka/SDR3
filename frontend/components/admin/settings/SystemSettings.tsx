'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Shield, Users, Dog, MessageSquare } from 'lucide-react'

interface SystemConfig {
  max_dogs_per_user: number
  max_simultaneous_users: number
  require_vaccination: boolean
  vaccination_validity_days: number
  allow_guest_viewing: boolean
  enable_sns_features: boolean
  enable_event_registration: boolean
  maintenance_mode: boolean
  maintenance_message: string
  terms_of_service: string
  privacy_policy: string
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    max_dogs_per_user: 3,
    max_simultaneous_users: 50,
    require_vaccination: true,
    vaccination_validity_days: 365,
    allow_guest_viewing: true,
    enable_sns_features: true,
    enable_event_registration: true,
    maintenance_mode: false,
    maintenance_message: '',
    terms_of_service: '',
    privacy_policy: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSystemConfig()
  }, [])

  const fetchSystemConfig = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .single()
    
    if (!error && data) {
      setConfig(data.config || config)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    const { error } = await supabase
      .from('system_config')
      .upsert({
        id: 1, // 単一レコード
        config: config,
        updated_at: new Date().toISOString(),
      })
    
    if (!error) {
      alert('システム設定を更新しました')
    } else {
      alert('更新に失敗しました')
    }
    
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 基本設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold">基本設定</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="max-dogs">
              <Dog className="inline h-4 w-4 mr-1" />
              ユーザーあたりの最大犬登録数
            </Label>
            <Input
              id="max-dogs"
              type="number"
              value={config.max_dogs_per_user}
              onChange={(e) => setConfig({ ...config, max_dogs_per_user: parseInt(e.target.value) })}
              min="1"
              max="10"
            />
          </div>
          
          <div>
            <Label htmlFor="max-users">
              <Users className="inline h-4 w-4 mr-1" />
              同時最大利用者数
            </Label>
            <Input
              id="max-users"
              type="number"
              value={config.max_simultaneous_users}
              onChange={(e) => setConfig({ ...config, max_simultaneous_users: parseInt(e.target.value) })}
              min="1"
              max="200"
            />
          </div>
          
          <div>
            <Label htmlFor="vaccination-days">
              ワクチン証明書の有効期間（日）
            </Label>
            <Input
              id="vaccination-days"
              type="number"
              value={config.vaccination_validity_days}
              onChange={(e) => setConfig({ ...config, vaccination_validity_days: parseInt(e.target.value) })}
              min="30"
              max="730"
            />
          </div>
        </div>
      </div>

      {/* 機能設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold">機能設定</h2>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.require_vaccination}
              onChange={(e) => setConfig({ ...config, require_vaccination: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>ワクチン接種証明書を必須にする</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.allow_guest_viewing}
              onChange={(e) => setConfig({ ...config, allow_guest_viewing: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>ゲストユーザーの閲覧を許可</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enable_sns_features}
              onChange={(e) => setConfig({ ...config, enable_sns_features: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>SNS機能を有効にする</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enable_event_registration}
              onChange={(e) => setConfig({ ...config, enable_event_registration: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>イベント参加登録を有効にする</span>
          </label>
        </div>
      </div>

      {/* メンテナンスモード */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2 text-orange-600" />
          <h2 className="text-lg font-semibold">メンテナンスモード</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.maintenance_mode}
              onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
              className="h-4 w-4 text-orange-600 rounded border-gray-300"
            />
            <span className="font-medium">メンテナンスモードを有効にする</span>
          </label>
          
          {config.maintenance_mode && (
            <div>
              <Label htmlFor="maintenance-message">メンテナンスメッセージ</Label>
              <Textarea
                id="maintenance-message"
                value={config.maintenance_message}
                onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
                placeholder="メンテナンス中です。しばらくお待ちください。"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '設定を保存'}
        </Button>
      </div>
    </div>
  )
}