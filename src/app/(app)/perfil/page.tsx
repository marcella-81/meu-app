import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/perfil/ProfileForm'
import { LogoutButton } from '@/components/layout/LogoutButton'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <LogoutButton />
      </div>
      <ProfileForm userId={user.id} profile={profile} />
    </div>
  )
}