'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email ou senha incorretos')
      setLoading(false)
      return
    }

    router.replace('/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">Bem-vindo</h1>
        <p className="text-sm text-gray-500">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          Entrar
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-green-600 hover:underline">
          Criar conta
        </Link>
      </p>

    </div>
  )
}