import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { currentBlock, profile, status } = await request.json()

    let prompt = ''

    // ✅ Lógica condicional para status 'check'
    if (status === 'check') {
      if (currentBlock) {
        // 🎯 Tem bloco ativo: check-in focado na rotina
        prompt = `
Você é um assistente de produtividade pessoal amigável e direto.

O usuário tem o seguinte perfil:
- Trabalho/área: ${profile.work_type}
- O que atrapalha: ${profile.productivity_killers?.join(', ') || 'não especificado'}
- O que ajuda: ${profile.productivity_boosters?.join(', ') || 'não especificado'}

Agora são ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} e o bloco atual é "${currentBlock.title}" (${currentBlock.category}).

Manda uma mensagem curta e motivadora de check-in — máximo 2 frases. 
Pergunta se está conseguindo seguir o bloco atual.
Seja natural, como um amigo que está acompanhando.
Não use emojis excessivos — no máximo 1.
Responda em português do Brasil.
`
      } else {
        // 🌿 Sem bloco ativo: mensagem acolhedora geral
        prompt = `
Você é um assistente de produtividade pessoal amigável e direto.

O usuário tem o seguinte perfil:
- Trabalho/área: ${profile.work_type}
- O que ajuda: ${profile.productivity_boosters?.join(', ') || 'não especificado'}
- Hobbies: ${profile.hobbies?.join(', ') || 'não especificado'}

Agora são ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} e não há nenhum bloco ativo na rotina.

Manda uma mensagem curta e acolhedora — máximo 2 frases.
Pode sugerir algo leve baseado nos hobbies ou no que ajuda a pessoa.
Seja natural e gentil.
Não use emojis excessivos — no máximo 1.
Responda em português do Brasil.
`
      }
    } 
    // ✅ Resposta para "Sim, estou seguindo"
    else if (status === 'yes') {
      prompt = `
O usuário confirmou que está seguindo o bloco "${currentBlock?.title || 'sua rotina'}".
Manda uma mensagem curta de incentivo — máximo 1 frase.
Seja animado mas não exagerado.
Responda em português do Brasil.
`
    } 
    // ✅ Resposta para "Não consegui"
    else if (status === 'no') {
      prompt = `
O usuário disse que não está conseguindo seguir o bloco "${currentBlock?.title || 'sua rotina'}"${currentBlock?.category ? ` (${currentBlock.category})` : ''}.

Perfil do usuário:
- O que atrapalha: ${profile.productivity_killers?.join(', ') || 'não especificado'}
- O que ajuda: ${profile.productivity_boosters?.join(', ') || 'não especificado'}
- Hobbies: ${profile.hobbies?.join(', ') || 'não especificado'}

Sugira uma atividade alternativa leve mas produtiva que faça sentido para esse perfil.
Máximo 3 frases. Seja empático e prático.
Não force a rotina — às vezes um ajuste é melhor que forçar.
Responda em português do Brasil.
`
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Erro na IA' }, { status: 500 })
    }

    return NextResponse.json({ message: content.text })
    
  } catch (error) {
    console.error('Erro na API checkin:', error)
    // Fallback amigável em caso de erro
    return NextResponse.json({ 
      message: '🤖 Olá! Como está seu foco hoje? Estou aqui para te apoiar.' 
    })
  }
}