'use client'
import { useState, useEffect } from 'react'

interface Block {
  id: string
  title: string
  category: string
  start_time: string
  end_time: string
}

interface Profile {
  work_type: string
  productivity_killers: string[]
  productivity_boosters: string[]
  wellness_goals: string[]
  hobbies: string[]
}

interface Props {
  currentBlock: Block | null
  profile: Profile | null
}

export function CheckIn({ currentBlock, profile }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'check' | 'answered'>('idle')

  useEffect(() => {
    if (profile) {
      loadCheckin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlock?.id])

  async function loadCheckin() {
    setLoading(true)
    setStatus('check')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBlock, profile, status: 'check' }),
      })
      const data = await res.json()
      setMessage(data.message)
    } catch {
      setMessage('Não consegui carregar o check-in agora. Tente novamente.')
    }
    setLoading(false)
  }

  async function answer(answer: 'yes' | 'no') {
    setLoading(true)
    setStatus('answered')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBlock, profile, status: answer }),
      })
      const data = await res.json()
      setMessage(data.message)
    } catch {
      setMessage('Erro ao processar resposta.')
    }
    setLoading(false)
  }

  return (
    <div
      className="rounded-xl p-4 mb-6 border"
      style={{
        background: 'rgba(61,92,58,0.06)',
        borderColor: 'rgba(61,92,58,0.12)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--hero)' }}
        >
          <span style={{ fontSize: 14, color: 'white' }}>✦</span>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="flex gap-1 items-center py-2">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              {message || 'Carregando check-in...'}
            </p>
          )}

          {status === 'check' && !loading && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => answer('yes')}
                className="px-4 py-1.5 text-sm rounded-lg text-white transition-all"
                style={{ background: 'var(--hero)' }}
              >
                Sim, estou
              </button>
              <button
                onClick={() => answer('no')}
                className="px-4 py-1.5 text-sm rounded-lg transition-all"
                style={{ border: '1px solid rgba(61,92,58,0.2)', color: 'var(--hero)' }}
              >
                Não consegui
              </button>
            </div>
          )}

          {status === 'answered' && !loading && (
            <button
              onClick={loadCheckin}
              className="mt-3 text-xs underline transition-all"
              style={{ color: 'var(--accent)' }}
            >
              Novo check-in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}