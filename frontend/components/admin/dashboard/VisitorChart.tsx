'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'

export function VisitorChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // ダミーデータ生成（実際はAPIから取得）
    const generateData = () => {
      const result = []
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        result.push({
          date: format(date, 'MM/dd', { locale: ja }),
          visitors: Math.floor(Math.random() * 50) + 20,
          newUsers: Math.floor(Math.random() * 10) + 5,
        })
      }
      return result
    }

    setData(generateData())
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        利用者数推移（過去7日間）
      </h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            labelFormatter={(value) => `${value}`}
            formatter={(value: any) => [`${value}人`, '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="visitors" 
            stroke="#3B82F6" 
            name="利用者数"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke="#10B981" 
            name="新規登録"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}