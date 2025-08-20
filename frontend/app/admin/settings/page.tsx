'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BusinessHoursSettings } from '@/components/admin/settings/BusinessHoursSettings'
import { SpecialHolidaysSettings } from '@/components/admin/settings/SpecialHolidaysSettings'
import { SystemSettings } from '@/components/admin/settings/SystemSettings'
import { Settings, Clock, Calendar, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>
        <p className="text-gray-600 mt-1">営業時間やシステムの各種設定を管理します</p>
      </div>
      
      <Tabs defaultValue="business-hours" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            営業時間
          </TabsTrigger>
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            特別休業日
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            システム設定
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="business-hours" className="mt-6">
          <BusinessHoursSettings />
        </TabsContent>
        
        <TabsContent value="holidays" className="mt-6">
          <SpecialHolidaysSettings />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}