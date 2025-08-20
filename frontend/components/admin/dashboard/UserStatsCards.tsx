import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'

interface UserStatsCardsProps {
  stats?: {
    totalUsers: number
    activeUsers: number
    suspendedUsers: number
    newUsersThisMonth: number
  }
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersThisMonth: 0,
  }
  
  const data = stats || defaultStats
  
  const cards = [
    {
      title: '総ユーザー数',
      value: data.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'アクティブ',
      value: data.activeUsers,
      icon: UserCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: '停止中',
      value: data.suspendedUsers,
      icon: UserX,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: '今月の新規',
      value: data.newUsersThisMonth,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}