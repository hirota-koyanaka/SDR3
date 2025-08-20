'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, TrendingUp, Users, Dog, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'

interface StatsData {
  totalUsers: number
  totalDogs: number
  totalVisits: number
  activeEvents: number
  dailyVisits: { date: string; count: number }[]
  userGrowth: { month: string; count: number }[]
  dogBreeds: { breed: string; count: number }[]
  peakHours: { hour: string; count: number }[]
}

export function StatsDashboard() {
  const [period, setPeriod] = useState('month') // week, month, year
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    fetchStats()
  }, [period])
  
  const fetchStats = async () => {
    setIsLoading(true)
    
    try {
      // 基本統計を取得
      const [
        { count: totalUsers },
        { count: totalDogs },
        { count: totalVisits },
        { count: activeEvents }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('dogs').select('*', { count: 'exact', head: true }),
        supabase.from('entry_logs').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true })
          .gte('event_date', new Date().toISOString())
      ])
      
      // 期間に応じた訪問数データを取得
      const now = new Date()
      const startDate = period === 'week' 
        ? new Date(now.setDate(now.getDate() - 7))
        : period === 'month'
        ? startOfMonth(now)
        : new Date(now.setFullYear(now.getFullYear() - 1))
      
      const { data: visits } = await supabase
        .from('entry_logs')
        .select('entry_time')
        .gte('entry_time', startDate.toISOString())
        .order('entry_time')
      
      // 日別訪問数を集計
      const dailyVisitsMap = new Map<string, number>()
      visits?.forEach(visit => {
        const date = format(new Date(visit.entry_time), 'yyyy-MM-dd')
        dailyVisitsMap.set(date, (dailyVisitsMap.get(date) || 0) + 1)
      })
      
      const dailyVisits = Array.from(dailyVisitsMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
      
      // 犬種統計（ダミーデータ）
      const dogBreeds = [
        { breed: '柴犬', count: 25 },
        { breed: 'トイプードル', count: 20 },
        { breed: 'チワワ', count: 15 },
        { breed: 'ミックス', count: 18 },
        { breed: 'その他', count: 22 }
      ]
      
      // ピーク時間帯（ダミーデータ）
      const peakHours = [
        { hour: '9時', count: 5 },
        { hour: '10時', count: 12 },
        { hour: '11時', count: 18 },
        { hour: '12時', count: 8 },
        { hour: '13時', count: 10 },
        { hour: '14時', count: 15 },
        { hour: '15時', count: 20 },
        { hour: '16時', count: 16 }
      ]
      
      // ユーザー増加傾向（ダミーデータ）
      const userGrowth = [
        { month: '1月', count: 50 },
        { month: '2月', count: 65 },
        { month: '3月', count: 80 },
        { month: '4月', count: 95 },
        { month: '5月', count: 110 },
        { month: '6月', count: 128 }
      ]
      
      setStatsData({
        totalUsers: totalUsers || 0,
        totalDogs: totalDogs || 0,
        totalVisits: totalVisits || 0,
        activeEvents: activeEvents || 0,
        dailyVisits,
        userGrowth,
        dogBreeds,
        peakHours
      })
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const exportToCSV = () => {
    if (!statsData) return
    
    // CSVデータを作成
    const csvData = [
      ['里山ドッグラン利用統計レポート'],
      ['作成日', format(new Date(), 'yyyy年MM月dd日', { locale: ja })],
      [],
      ['基本統計'],
      ['総ユーザー数', statsData.totalUsers],
      ['総登録犬数', statsData.totalDogs],
      ['総訪問回数', statsData.totalVisits],
      ['開催予定イベント', statsData.activeEvents],
      [],
      ['日別訪問数'],
      ['日付', '訪問数'],
      ...statsData.dailyVisits.map(d => [d.date, d.count]),
      [],
      ['犬種別統計'],
      ['犬種', '登録数'],
      ...statsData.dogBreeds.map(d => [d.breed, d.count]),
      [],
      ['時間帯別利用状況'],
      ['時間', '利用者数'],
      ...statsData.peakHours.map(d => [d.hour, d.count])
    ]
    
    // CSVファイルを生成
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `satoyama_dogrun_stats_${format(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }
  
  const COLORS = ['#003DA5', '#00A650', '#FFC107', '#FF5722', '#9C27B0']
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!statsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">統計データの取得に失敗しました</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">統計レポート</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">1週間</SelectItem>
              <SelectItem value="month">1ヶ月</SelectItem>
              <SelectItem value="year">1年</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            CSVエクスポート
          </Button>
        </div>
      </div>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総ユーザー数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{statsData.totalUsers}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>登録犬数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Dog className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold">{statsData.totalDogs}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総訪問回数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold">{statsData.totalVisits}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>開催予定イベント</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold">{statsData.activeEvents}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>訪問数推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#003DA5" 
                  name="訪問数"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>犬種別統計</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statsData.dogBreeds}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.breed} (${entry.count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statsData.dogBreeds.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>時間帯別利用状況</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00A650" name="利用者数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>ユーザー増加傾向</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FF5722" 
                  name="ユーザー数"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}