import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name ?? user.email ?? ''

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar userName={name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}