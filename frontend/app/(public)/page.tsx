import { Hero } from '@/components/user/home/Hero'
import { Features } from '@/components/user/home/Features'
import { ApplicationCTA } from '@/components/user/home/ApplicationCTA'
import { Announcements } from '@/components/user/home/Announcements'
import { BusinessHours } from '@/components/user/home/BusinessHours'

export default async function HomePage() {
  // TODO: 実際のAPIから取得
  const announcements = [
    {
      id: '1',
      title: '年末年始の営業について',
      content: '12月29日から1月3日まで休業いたします。新年は1月4日から通常営業となります。',
      created_at: '2024-12-20T00:00:00Z',
      category: 'お知らせ'
    },
    {
      id: '2',
      title: '新年イベント開催のお知らせ',
      content: '1月14日（日）に新年イベントを開催します。ドッグランレースや撮影会など楽しいイベントが盛りだくさん！',
      created_at: '2024-12-18T00:00:00Z',
      category: 'イベント'
    },
    {
      id: '3',
      title: 'メンテナンスのお知らせ',
      content: '12月25日（月）は設備メンテナンスのため臨時休業いたします。',
      created_at: '2024-12-15T00:00:00Z',
      category: 'メンテナンス'
    }
  ]
  
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Announcements announcements={announcements} />
      <BusinessHours />
      <ApplicationCTA />
    </div>
  )
}