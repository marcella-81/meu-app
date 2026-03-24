'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  value: string
  label: string
  icon: string
  color: string
}

export function AddGoalModal({ 
  isOpen, 
  onClose, 
  userId,
  categories 
}: { 
  isOpen: boolean
  onClose: () => void
  userId: string
  categories: Category[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    const { error } = await supabase
    .from('goals')
    .insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        target_date: endDate || null,
        start_date: startDate || new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'active',
        user_id: userId,
    })

    if (!error) {
      setTitle('')
      setDescription('')
      setCategory('personal')
      setPriority('medium')
      setTargetDate('')
      onClose()
      window.location.reload()
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl p-6 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            ✨ Nova Meta
          </h2>
          <button 
            onClick={onClose}
            className="text-xl opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
              Título da Meta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aprender inglês fluente"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--hero)]"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua meta em detalhes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--hero)] resize-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    category === cat.value ? 'ring-2 ring-[var(--hero)]' : ''
                  }`}
                  style={{
                    background: category === cat.value ? cat.color : 'var(--bg)',
                    color: category === cat.value ? 'white' : 'var(--text2)',
                  }}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
              Prioridade
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  priority === 'high' ? 'ring-2 ring-red-500' : ''
                }`}
                style={{
                  background: priority === 'high' ? '#FEE2E2' : 'var(--bg)',
                  color: priority === 'high' ? '#DC2626' : 'var(--text2)',
                }}
              >
                🔥 Alta
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  priority === 'medium' ? 'ring-2 ring-amber-500' : ''
                }`}
                style={{
                  background: priority === 'medium' ? '#FEF3C7' : 'var(--bg)',
                  color: priority === 'medium' ? '#D97706' : 'var(--text2)',
                }}
              >
                ⚡ Média
              </button>
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  priority === 'low' ? 'ring-2 ring-gray-500' : ''
                }`}
                style={{
                  background: priority === 'low' ? '#F3F4F6' : 'var(--bg)',
                  color: priority === 'low' ? '#4B5563' : 'var(--text2)',
                }}
              >
                💤 Baixa
              </button>
            </div>
          </div>

          {/* Datas da Meta */}
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
      Data de Início
    </label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--hero)]"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
    />
  </div>
  <div>
    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
      Data Limite *
    </label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      min={startDate}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--hero)]"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
      required
    />
  </div>
</div>

          {/* Data Alvo */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text3)' }}>
              Data Alvo (opcional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--hero)]"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--hero)' }}
            >
              {loading ? 'Criando...' : '✨ Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}