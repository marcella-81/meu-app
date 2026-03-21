'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-red-500 transition-all"
    >
      Sair
    </button>
  )
}