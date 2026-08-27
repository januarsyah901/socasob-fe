'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Tv,
  Eye,
  CheckCircle2,
  Volume2,
  VolumeX,
  Smile,
  Flame,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { playGentleChime } from '@/lib/desktop-notifications'
import { useSocket, beApi } from '@/lib/socket-context'

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

interface EyeExerciseModalProps {
  open: boolean
  onClose: () => void
  initialMode?: 'youtube' | 'animated'
}

const STEPS = [
  {
    step: 1,
    title: 'Aturan 20-20-20: Pandang Jauh',
    duration: 20,
    desc: 'Alihkan pandangan dari layar ke objek sejauh minimal 6 meter (20 kaki) untuk melemaskan otot siliaris mata.',
    targetPos: 'center',
    tip: 'Tatap pepohonan di luar jendela atau sudut terjauh di ruangan Anda.',
  },
  {
    step: 2,
    title: 'Peregangan Okular 8 Arah',
    duration: 20,
    desc: 'Ikuti bola target bergerak secara perlahan tanpa menggerakkan kepala Anda.',
    targetPos: 'moving',
    tip: 'Latih kelenturan otot ekstraokular mata ke atas, bawah, kiri, kanan, dan diagonal.',
  },
  {
    step: 3,
    title: 'Teknik Palming & Relaksasi',
    duration: 20,
    desc: 'Gosok kedua telapak tangan hingga hangat, lalu tempelkan lembut di atas kelopak mata terpejam.',
    targetPos: 'palming',
    tip: 'Bernapas perlahan dan biarkan kehangatan telapak tangan meredakan kelelahan mata.',
  },
]

export function EyeExerciseModal({ open, onClose, initialMode = 'youtube' }: EyeExerciseModalProps) {
  const { robotId } = useSocket()
  const [activeTab, setActiveTab] = useState<'youtube' | 'animated'>(initialMode)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(STEPS[0].duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedBreaks, setCompletedBreaks] = useState(0)
  const [youtubeVideoId, setYoutubeVideoId] = useState('0wQszk3kPqA')
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const currentStep = STEPS[currentStepIdx]

  const recordBreakToBackend = async () => {
    try {
      const activeId = robotId || undefined
      await beApi('/api/log/break', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotId: activeId, duration: 20 }),
      })
    } catch (e) {
      console.warn('[Exercise] Failed to record break to backend', e)
    }
  }

  // Read / save completed breaks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('socasob-completed-breaks')
    if (saved) setCompletedBreaks(parseInt(saved, 10) || 0)
  }, [])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      playGentleChime('relax')
      if (currentStepIdx < STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1)
        setTimeLeft(STEPS[currentStepIdx + 1].duration)
      } else {
        setIsRunning(false)
        setIsCompleted(true)
        playGentleChime('success')
        const newCount = completedBreaks + 1
        setCompletedBreaks(newCount)
        localStorage.setItem('socasob-completed-breaks', String(newCount))
        recordBreakToBackend()
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, currentStepIdx, completedBreaks, robotId])

  const handleStart = () => {
    setIsRunning(true)
    setIsCompleted(false)
    playGentleChime('relax')
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentStepIdx(0)
    setTimeLeft(STEPS[0].duration)
    setIsCompleted(false)
  }

  const handleNextStep = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1)
      setTimeLeft(STEPS[currentStepIdx + 1].duration)
      setIsRunning(false)
    } else {
      setIsCompleted(true)
      setIsRunning(false)
    }
  }

  const handleUpdateYoutubeUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customYoutubeUrl.trim()) return
    let vidId = customYoutubeUrl.trim()
    if (customYoutubeUrl.includes('v=')) {
      vidId = customYoutubeUrl.split('v=')[1].split('&')[0]
    } else if (customYoutubeUrl.includes('youtu.be/')) {
      vidId = customYoutubeUrl.split('youtu.be/')[1].split('?')[0]
    } else if (customYoutubeUrl.includes('embed/')) {
      vidId = customYoutubeUrl.split('embed/')[1].split('?')[0]
    }
    setYoutubeVideoId(vidId)
    setShowUrlInput(false)
    setCustomYoutubeUrl('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Panduan Senam Mata 20-20-20" className="max-w-2xl">
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('youtube')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'youtube'
                  ? 'bg-signal-blue text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              )}
            >
              <YoutubeIcon className="w-4 h-4 text-red-500 fill-current" />
              <span>Video Tutorial YouTube</span>
            </button>
            <button
              onClick={() => setActiveTab('animated')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'animated'
                  ? 'bg-signal-blue text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              )}
            >
              <Eye className="w-4 h-4 text-active-teal" />
              <span>Latihan Interaktif (20s)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted font-medium">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{completedBreaks} Sesi Selesai</span>
          </div>
        </div>

        {/* Tab 1: YouTube Video Embed */}
        {activeTab === 'youtube' && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 border border-border shadow-dreamy-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Panduan Senam Mata 20-20-20"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Sub info & custom URL changer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-surface-2 rounded-2xl border border-border">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-signal-blue/10 text-signal-blue shrink-0">
                  <Tv className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-text">Panduan Relaksasi Layar & Senam Otot Mata</p>
                  <p className="text-[11px] text-text-muted">Ikuti video 1-2 menit untuk meregangkan otot penglihatan.</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs text-signal-blue hover:underline font-medium cursor-pointer"
                >
                  {showUrlInput ? 'Tutup URL' : 'Ganti Video YouTube'}
                </button>
              </div>
            </div>

            {showUrlInput && (
              <form onSubmit={handleUpdateYoutubeUrl} className="flex gap-2 animate-fade-up">
                <input
                  type="text"
                  placeholder="Paste link YouTube (misal: https://youtu.be/...)"
                  value={customYoutubeUrl}
                  onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                  className="input-base text-xs py-2"
                />
                <Button type="submit" size="sm" variant="primary" className="text-xs shrink-0">
                  Pasang Video
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Interactive 20-20-20 Countdown & Eye Follow Animation */}
        {activeTab === 'animated' && (
          <div className="space-y-4 animate-fade-in">
            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2">
              {STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => {
                    setCurrentStepIdx(idx)
                    setTimeLeft(s.duration)
                    setIsRunning(false)
                  }}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                    idx === currentStepIdx
                      ? 'border-signal-blue bg-signal-blue/10'
                      : idx < currentStepIdx
                        ? 'border-active-teal/40 bg-active-teal/5 text-text-muted'
                        : 'border-border bg-surface-2 text-text-muted opacity-75'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Langkah {s.step}
                    </span>
                    {idx < currentStepIdx && <CheckCircle2 className="w-3.5 h-3.5 text-active-teal" />}
                  </div>
                  <p className="text-xs font-semibold line-clamp-1">{s.title}</p>
                </button>
              ))}
            </div>

            {/* Interactive Stage */}
            <div className="relative h-64 rounded-2xl bg-surface-2 border border-border p-6 flex flex-col items-center justify-between overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-signal-blue/5 to-active-teal/5 pointer-events-none" />

              {/* Countdown badge */}
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Sisa Waktu
                </span>
                <span className="text-3xl font-black font-figtree text-signal-blue tabular-nums">
                  {timeLeft}s
                </span>
              </div>

              {/* Center Animation Target */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center">
                {currentStep.targetPos === 'center' && (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-signal-blue/20 border-2 border-signal-blue flex items-center justify-center shadow-lg">
                      <Eye className="w-8 h-8 text-signal-blue" />
                    </div>
                    <span className="text-xs font-semibold text-text">Tatap Objek Sejauh 6 Meter (20 Kaki)</span>
                  </div>
                )}

                {currentStep.targetPos === 'moving' && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-active-teal border-2 border-white shadow-[0_0_20px_rgba(66,179,177,0.5)] animate-drift flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <span className="text-xs font-semibold text-text">Ikuti Gerakan Objek dengan Bola Mata</span>
                  </div>
                )}

                {currentStep.targetPos === 'palming' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shadow-lg">
                      <Smile className="w-8 h-8 text-amber-500" />
                    </div>
                    <span className="text-xs font-semibold text-text">Tutup Kelopak Mata & Rasakan Kehangatan Tangan</span>
                  </div>
                )}
              </div>

              <p className="relative z-10 text-xs text-center text-text-muted italic max-w-md">
                💡 {currentStep.tip}
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button size="sm" variant="secondary" onClick={handleReset} className="gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Ulangi
              </Button>

              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <Button size="md" variant="primary" onClick={handleStart} className="gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Mulai Sesi
                  </Button>
                ) : (
                  <Button size="md" variant="secondary" onClick={handlePause} className="gap-2">
                    <Pause className="w-4 h-4" />
                    Jeda
                  </Button>
                )}

                {currentStepIdx < STEPS.length - 1 && (
                  <Button size="sm" variant="ghost" onClick={handleNextStep} className="text-xs">
                    Lanjut →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Success Banner */}
        {isCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3.5 animate-fade-up">
            <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                🎉 Selamat! Sesi Relaksasi 20-20-20 Berhasil Selesai!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Otot akomodasi mata Anda telah relaks. Kepatuhan istirahat harian Anda meningkat!
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
