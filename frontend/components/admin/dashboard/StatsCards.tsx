import { Users, FileText, Calendar, Dog } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalUsers: number
    pendingApplications: number
    upcomingEvents: number
    currentVisitors: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: '総ユーザー数',
      value: stats.totalUsers,
      icon: Users,
      change: '+12%',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: '承認待ち申請',
      value: stats.pendingApplications,
      icon: FileText,
      change: `${stats.pendingApplications}件`,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: '今後のイベント',
      value: stats.upcomingEvents,
      icon: Calendar,
      change: '今月',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: '現在の利用者',
      value: stats.currentVisitors,
      icon: Dog,
      change: '入場中',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
                <p className={`text-sm mt-2 ${card.textColor}`}>
                  {card.change}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}