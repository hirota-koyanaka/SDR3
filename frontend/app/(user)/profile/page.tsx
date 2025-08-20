import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/user/profile/ProfileView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // TODO: 実際のDBから取得
  const userData = {
    id: user?.id,
    email: user?.email,
    name: user?.user_metadata?.name || '未設定',
    phone: user?.user_metadata?.phone || '未設定',
    avatar_url: null,
    created_at: user?.created_at,
    dogs_count: 0,
    posts_count: 0,
    visits_count: 0,
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイプロフィール</h1>
        <Link href="/profile/edit">
          <Button>
            <Edit className="mr-2" size={16} />
            編集
          </Button>
        </Link>
      </div>
      
      <ProfileView userData={userData} />
    </div>
  )
}