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
  if (currentBlock && profile) {
    loadCheckin()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentBlock?.id])

  async function loadCheckin() {
    setLoading(true)
    setStatus('check')
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentBlock,
        profile,
        status: 'check',
      }),
    })
    const data = await res.json()
    setMessage(data.message)
    setLoading(false)
  }

  async function answer(answer: 'yes' | 'no') {
    setLoading(true)
    setStatus('answered')
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentBlock,
        profile,
        status: answer,
      }),
    })
    const data = await res.json()
    setMessage(data.message)
    setLoading(false)
  }

  if (!currentBlock) return null

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span style={{ fontSize: 14 }}>✦</span>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="flex gap-1 items-center py-1">
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-sm text-violet-900 leading-relaxed">{message}</p>
          )}

          {status === 'check' && !loading && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => answer('yes')}
                className="px-4 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-all"
              >
                Sim, estou
              </button>
              <button
                onClick={() => answer('no')}
                className="px-4 py-1.5 border border-violet-300 text-violet-700 text-sm rounded-lg hover:bg-violet-100 transition-all"
              >
                Não consegui
              </button>
            </div>
          )}

          {status === 'answered' && !loading && (
            <button
              onClick={loadCheckin}
              className="mt-3 text-xs text-violet-500 hover:text-violet-700 underline"
            >
              Novo check-in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}