'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn, timeAgo } from '@/lib/utils'
import {
  MessagesSquare,
  Bot,
  Plus,
  SendHorizontal,
  Trash2,
  Eye,
  ShieldCheck,
  Zap,
  Info,

} from 'lucide-react'
import { useSocket, beApi } from '@/lib/socket-context'

interface ConversationSummary {
  id: string
  title: string
  updatedAt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface FullConversation extends ConversationSummary {
  messages: Message[]
}

const DEFAULT_SUGGESTIONS = [
  'Bagaimana kondisi kesehatan mata dan durasi layarku hari ini?',
  'Bagaimana cara mencegah Computer Vision Syndrome (CVS)?',
  'Jelaskan cara kerja aturan 20-20-20 untuk relaksasi mata.',
  'Berapa jarak ideal antara mata dan layar monitor?',
  'Mengapa frekuensi berkedip berkurang saat menatap layar?',
  'Apa tanda-tanda awal terjadinya progresi miopia (rabun jauh)?',
]

/** Typewriter renderer — gives streaming feel regardless of provider. */
function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= text.length) {
      onDone()
      return
    }
    const step = Math.max(2, Math.round(text.length / 90))
    const t = setTimeout(() => setShown((s) => Math.min(text.length, s + step)), 18)
    return () => clearTimeout(t)
  }, [shown, text, onDone])
  return <>{text.slice(0, shown)}</>
}

/** Built-in fallback intelligent ophthalmology response engine */
function generateFallbackResponse(query: string, patientName = 'Pengguna'): string {
  const q = query.toLowerCase()

  if (q.includes('20-20-20') || q.includes('aturan 20') || q.includes('istirahat')) {
    return (
      `🌿 **Panduan Aturan 20-20-20 (Gold Standard Ergonomi Visual):**\n\n` +
      `Setiap **20 menit** Anda menatap layar monitor, alihkan pandangan ke suatu objek berjarak minimal **20 kaki (sekitar 6 meter)** selama minimal **20 detik**.\n\n` +
      `**Mengapa ini sangat krusial?**\n` +
      `• Mengistirahatkan otot siliaris mata yang terus menegang saat akomodasi jarak dekat.\n` +
      `• Membantu kelenjar meibom menyebarkan lapisan lipid air mata agar kornea tidak kering.\n` +
      `• Anda bisa membuka modul **Senam Mata** di SocaSob untuk dipandu video & timer 20 detik secara interaktif!`
    )
  }

  if (q.includes('jarak') || q.includes('dekat') || q.includes('cm') || q.includes('posisi')) {
    return (
      `📏 **Standar Jarak Aman Layar & Posisi Ergonomis:**\n\n` +
      `1. **Jarak Ideal:** Minimal **30–50 cm** (kira-kira sepanjang satu rentangan lengan Anda).\n` +
      `2. **Tinggi Monitor:** Bagian atas layar sejajar atau sedikit di bawah garis horizontal mata (10–15 derajat ke bawah).\n` +
      `3. **Peringatan SocaSob:** Jika kamera sensor mendeteksi jarak Anda < 30 cm, sistem akan langsung memberikan sinyal suara & visual untuk memundurkan posisi.`
    )
  }

  if (q.includes('kedip') || q.includes('blink') || q.includes('kering')) {
    return (
      `💧 **Frekuensi Berkedip & Kesehatan Air Mata:**\n\n` +
      `Dalam kondisi santai, manusia berkedip sekitar **15–20 kali per menit**. Namun saat fokus menatap layar komputer/HP, frekuensi kedipan turun drastis hingga **5–7 kali per menit** (penurunan >60%)!\n\n` +
      `**Solusi:** Lakukan latihan *conscious blinking* atau gunakan tetes mata *artificial tears* tanpa pengawet jika terasa sangat kering.`
    )
  }

  return (
    `Halo ${patientName}! Terima kasih telah berkonsultasi dengan **Teman Soca**.\n\n` +
    `Mengenai pertanyaan Anda: *" ${query} "*\n\n` +
    `Kesehatan mata saat menatap layar komputer bergantung pada 3 pilar utama:\n` +
    `1. **Jarak Aman:** Pertahankan jarak monitor minimal **30–50 cm**.\n` +
    `2. **Micro-Break Teratur:** Terapkan aturan **20-20-20** dan lakukan peregangan otot siliaris secara berkala.\n` +
    `3. **Pencahayaan Seimbang:** Sesuaikan kecerahan layar agar tidak silau dan tidak terlalu redup dibandingkan ruangan sekitar.\n\n` +
    `Anda dapat memantau telemetri jarak mata real-time di Dashboard, atau membuka menu **Senam Mata** untuk panduan relaksasi interaktif!`
  )
}

const INITIAL_CONVERSATIONS: FullConversation[] = []

export function CompanionChat() {
  const toast = useToast()
  const { robotId } = useSocket()
  const [conversations, setConversations] = useState<FullConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>('conv-init-1')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stopAnimating = useCallback(() => setAnimatingId(null), [])

  // Load conversations from backend or fallback to localStorage
  const loadConversations = useCallback(async () => {
    try {
      const res = await beApi('/api/companion/conversations')
      if (res.success && Array.isArray(res.data)) {
        if (res.data.length > 0) {
          const formatted: FullConversation[] = res.data.map((c: any) => ({
            id: c.conversationId || c._id,
            title: c.title,
            updatedAt: c.updatedAt || new Date().toISOString(),
            messages: (c.messages || []).map((m: any) => ({
              id: m.id || m._id || `msg-${Math.random()}`,
              role: m.role,
              content: m.content,
            })),
          }))
          setConversations(formatted)
          setActiveId((prev) => prev || formatted[0].id)
          const currentTarget = formatted.find((c) => c.id === (activeId || formatted[0].id))
          if (currentTarget) setMessages(currentTarget.messages)
        } else {
          setConversations([])
          setActiveId(null)
          setMessages([])
        }
        return
      }
    } catch {
      console.warn('[Companion] Fallback to localStorage')
    }

    const saved = localStorage.getItem('socasob-companion-conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0) {
            setConversations(parsed)
            setActiveId(parsed[0].id)
            setMessages(parsed[0].messages)
          } else {
            setConversations([])
            setActiveId(null)
            setMessages([])
          }
          return
        }
      } catch {}
    }
    
    setConversations(INITIAL_CONVERSATIONS)
    setActiveId(INITIAL_CONVERSATIONS[0].id)
    setMessages(INITIAL_CONVERSATIONS[0].messages)
  }, [activeId])

  useEffect(() => {
    loadConversations()
  }, [])

  // Sync to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('socasob-companion-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending, animatingId])

  function openConversation(id: string) {
    setActiveId(id)
    setAnimatingId(null)
    const target = conversations.find((c) => c.id === id)
    if (target) {
      setMessages(target.messages)
    } else {
      setMessages([])
    }
  }

  function startNewConversation() {
    setActiveId(null)
    setMessages([])
    setAnimatingId(null)
  }

  async function removeConversation(id: string) {
    try {
      await beApi(`/api/companion/conversations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    } catch {}

    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    localStorage.setItem('socasob-companion-conversations', JSON.stringify(updated))
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id)
        setMessages(updated[0].messages)
      } else {
        setActiveId(null)
        setMessages([])
      }
    }
    toast('success', 'Percakapan berhasil dihapus.')
  }

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending) return
    setSending(true)
    setInput('')

    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    try {
      const res = await beApi('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: activeId || undefined,
          robotId: robotId || undefined,
          patientName: 'Pengguna',
        }),
      })

      if (res.success && res.data) {
        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: res.data.reply,
        }
        const finalMessages = [...updatedMessages, assistantMsg]
        setMessages(finalMessages)
        setAnimatingId(assistantMsg.id)

        const targetConvId = res.data.conversationId || activeId || `conv-${Date.now()}`
        const newTitle =
          res.data.title || (content.length > 32 ? content.slice(0, 32) + '…' : content)

        setActiveId(targetConvId)
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === targetConvId)
          if (exists) {
            return prev.map((c) =>
              c.id === targetConvId
                ? { ...c, updatedAt: new Date().toISOString(), messages: finalMessages }
                : c
            )
          }
          return [
            {
              id: targetConvId,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMessages,
            },
            ...prev,
          ]
        })
        setSending(false)
        return
      }
    } catch (err) {
      console.warn('[Companion] Backend chat error, using offline fallback engine', err)
    }

    // Offline fallback
    setTimeout(() => {
      const responseText = generateFallbackResponse(content, 'Pengguna')
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
      }
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)
      setAnimatingId(assistantMsg.id)

      if (!activeId) {
        const newId = `conv-${Date.now()}`
        const newTitle = content.length > 32 ? content.slice(0, 32) + '…' : content
        const newConv: FullConversation = {
          id: newId,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: finalMessages,
        }
        setActiveId(newId)
        setConversations((prev) => [newConv, ...prev])
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, updatedAt: new Date().toISOString(), messages: finalMessages }
              : c
          )
        )
      }
      setSending(false)
    }, 400)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-6.5rem)] animate-fade-up">
      {/* ── Conversation List Sidebar ── */}
      <aside className="lg:w-72 shrink-0 card p-3.5 flex flex-col max-h-56 lg:max-h-none shadow-dreamy">
        <Button
          variant="secondary"
          size="sm"
          className="w-full mb-3 gap-2 font-semibold text-xs py-2 cursor-pointer shadow-xs"
          onClick={startNewConversation}
        >
          <Plus className="w-4 h-4 text-signal-blue" />
          <span>Percakapan Baru</span>
        </Button>

        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {conversations.length === 0 && (
            <p className="text-xs text-text-muted text-center py-8 px-3">
              Belum ada percakapan — ajukan pertanyaan pertamamu kepada Teman Soca.
            </p>
          )}

          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all',
                activeId === c.id
                  ? 'bg-signal-blue text-white font-semibold shadow-sm'
                  : 'hover:bg-surface-2 text-text'
              )}
              onClick={() => openConversation(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openConversation(c.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate leading-tight">{c.title}</p>
                <p
                  className={cn(
                    'text-[10px] mt-0.5',
                    activeId === c.id ? 'text-white/75' : 'text-text-muted'
                  )}
                >
                  {timeAgo(c.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeConversation(c.id)
                }}
                aria-label="Hapus percakapan"
                className={cn(
                  'p-1.5 rounded-lg cursor-pointer transition-all',
                  activeId === c.id
                    ? 'text-white/80 hover:text-white hover:bg-white/20'
                    : 'text-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Chat Area ── */}
      <section className="card flex-1 flex flex-col min-h-[65vh] shadow-dreamy-lg">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-signal-blue/10 flex items-center justify-center text-signal-blue">
              <MessagesSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-text leading-tight">Teman Soca AI</h1>
                <span className="flex items-center gap-1 text-[9px] font-bold text-signal-blue bg-signal-blue/10 px-2 py-0.5 rounded-full">

                  Telemetri Aktif
                </span>
              </div>
              <p className="text-[10px] text-text-muted font-medium">
                Konsultan AI Ergonomi & Kesehatan Penglihatan
              </p>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <span className="rounded-2xl bg-signal-blue/10 p-4 text-signal-blue mb-4 shadow-sm">
                <Eye className="w-8 h-8" />
              </span>
              <h2 className="font-bold text-base text-text">Tanya Seputar Kesehatan Matamu</h2>
              <p className="mt-1.5 text-xs text-text-muted max-w-md leading-relaxed">
                Teman Soca memahami data monitoring harianmu, aturan ergonomi 20-20-20, pencegahan CVS,
                pencahayaan monitor ideal, dan teknik relaksasi mata.
              </p>

              {/* Suggestions chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
                {DEFAULT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-surface-2 border border-border rounded-full px-3.5 py-1.5 text-text-muted hover:text-text hover:border-signal-blue/50 transition-all cursor-pointer shadow-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed whitespace-pre-line shadow-xs',
                  m.role === 'user'
                    ? 'bg-signal-blue text-white rounded-br-xs font-medium'
                    : 'bg-surface-2 border border-border text-text rounded-bl-xs'
                )}
              >
                {m.role === 'assistant' && m.id === animatingId ? (
                  <TypewriterText text={m.content} onDone={stopAnimating} />
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start" aria-label="Teman Soca sedang menyusun saran">
              <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-xs px-4 py-3 flex gap-1.5 items-center">
                <span className="text-xs text-text-muted mr-1 font-medium">Teman Soca menganalisis</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-signal-blue"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="border-t border-border p-3.5 flex gap-2.5 items-center bg-surface"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya seputar telemetri hari ini, aturan 20-20-20, mata lelah…"
            aria-label="Pesan untuk teman soca"
            maxLength={2000}
            className="input-base flex-1 text-xs md:text-sm py-2.5"
            disabled={sending}
          />
          <Button
            type="submit"
            variant="primary"
            className="rounded-full px-4 py-2.5 shrink-0"
            disabled={!input.trim() || sending}
            aria-label="Kirim pesan"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </form>
      </section>
    </div>
  )
}
