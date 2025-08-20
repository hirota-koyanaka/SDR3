'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, Calendar, TrendingUp, Users, Dog, DoorOpen } from 'lucide-react'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })
  const [reportType, setReportType] = useState('overview')
  const [reportData, setReportData] = useState<any>({
    overview: null,
    users: null,
    entries: null,
    events: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [dateRange, reportType])

  const fetchReportData = async () => {
    setIsLoading(true)
    
    // ダミーデータ生成（実際はAPIから取得）
    const days = []
    const start = new Date(dateRange.from)
    const end = new Date(dateRange.to)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: format(new Date(d), 'MM/dd'),
        users: Math.floor(Math.random() * 50) + 20,
        entries: Math.floor(Math.random() * 100) + 50,
        newUsers: Math.floor(Math.random() * 10) + 5,
      })
    }
    
    setReportData({
      overview: {
        dailyData: days,
        totalUsers: 523,
        totalEntries: 2341,
        avgStayTime: 45,
        peakHour: '14:00',
      },
      users: {
        byCity: [
          { name: '今治市', value: 380, percentage: 72.6 },
          { name: '西条市', value: 80, percentage: 15.3 },
          { name: 'その他', value: 63, percentage: 12.1 },
        ],
        byDogCount: [
          { count: '1頭', users: 320 },
          { count: '2頭', users: 180 },
          { count: '3頭以上', users: 23 },
        ],
      },
      entries: {
        byHour: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          entries: Math.floor(Math.random() * 30) + 5,
        })),
        byDayOfWeek: [
          { day: '月', entries: 234 },
          { day: '火', entries: 198 },
          { day: '水', entries: 221 },
          { day: '木', entries: 187 },
          { day: '金', entries: 256 },
          { day: '土', entries: 412 },
          { day: '日', entries: 456 },
        ],
      },
      events: {
        participation: [
          { name: '愛犬運動会', participants: 45, capacity: 50 },
          { name: 'しつけ教室', participants: 28, capacity: 30 },
          { name: '健康相談会', participants: 15, capacity: 20 },
        ],
      },
    })
    
    setIsLoading(false)
  }

  const exportCSV = () => {
    alert('CSVエクスポート機能は準備中です')
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">レポート・統計</h1>
          <p className="text-gray-600 mt-1">施設利用状況の分析とレポート</p>
        </div>
        <Button onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          CSVエクスポート
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <Label>期間:</Label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="overview">概要</option>
            <option value="users">ユーザー分析</option>
            <option value="entries">入場分析</option>
            <option value="events">イベント分析</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            レポートを生成中...
          </div>
        ) : (
          <>
            {reportType === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">総利用者数</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {reportData.overview?.totalUsers}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">総入場回数</p>
                        <p className="text-2xl font-bold text-green-900">
                          {reportData.overview?.totalEntries}
                        </p>
                      </div>
                      <DoorOpen className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">平均滞在時間</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {reportData.overview?.avgStayTime}分
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">ピーク時間</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {reportData.overview?.peakHour}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">日別利用者数推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.overview?.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#3B82F6" name="利用者数" />
                      <Line type="monotone" dataKey="newUsers" stroke="#10B981" name="新規登録" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {reportType === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">居住地別ユーザー分布</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.users?.byCity}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name} (${entry.percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.users?.byCity.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">登録犬数別ユーザー数</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.users?.byDogCount}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="count" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'entries' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">時間帯別入場数</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.entries?.byHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="entries" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">曜日別入場数</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.entries?.byDayOfWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="entries" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {reportType === 'events' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">イベント参加状況</h3>
                <div className="space-y-4">
                  {reportData.events?.participation.map((event: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{event.name}</h4>
                        <span className="text-sm text-gray-600">
                          {event.participants}/{event.capacity}名
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(event.participants / event.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-gray-700">{children}</span>
}