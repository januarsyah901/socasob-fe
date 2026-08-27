'use client'

import { useSocket, LcdCommand, SpeakerCommand } from '@/lib/socket-context'
import { Bot, Volume2, VolumeX, Clock, AlertCircle, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HardwareActuatorPanel() {
  const { hardware, isConnected, mlWsConnected } = useSocket()

  const { lcdCommand, speakerCommand, fatigueDurationSec, breakRemainingSec, workElapsedSec } = hardware

  // Mapping info ekspresi LCD robot
  const getLcdConfig = (cmd: LcdCommand) => {
    switch (cmd) {
      case 'fatigue_5m':
        return {
          emoji: '😌',
          label: 'Mata Sayu',
          desc: '5 menit pertama terdeteksi kelelahan mata.',
          badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          faceBg: 'bg-amber-500/10 border-amber-500/30',
        }
      case 'fatigue_10m':
        return {
          emoji: '😠',
          label: 'Mata Kesal / Tajam',
          desc: '10+ menit lelah terus-menerus. Butuh istirahat!',
          badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          faceBg: 'bg-rose-500/10 border-rose-500/30',
        }
      case 'break_20m':
        return {
          emoji: '😊',
          label: 'Mata Senang (Resting)',
          desc: 'Mode istirahat 20 detik 20-20-20 aktif.',
          badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          faceBg: 'bg-emerald-500/10 border-emerald-500/30',
        }
      case 'dry_eye':
        return {
          emoji: '😣',
          label: 'Mata Sipit (Dry Eye)',
          desc: 'Gejala mata kering / frekuensi kedip rendah.',
          badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
          faceBg: 'bg-sky-500/10 border-sky-500/30',
        }
      case 'normal':
      default:
        return {
          emoji: '👀',
          label: 'Ekspresi Normal',
          desc: 'Pandangan mata segar & berkedip sehat.',
          badgeColor: 'bg-signal-blue/10 text-signal-blue border-signal-blue/20',
          faceBg: 'bg-signal-blue/5 border-signal-blue/20',
        }
    }
  }

  // Mapping info speaker sound effect
  const getSpeakerConfig = (cmd: SpeakerCommand) => {
    switch (cmd) {
      case 'cling':
        return { label: 'Cling (Startup)', color: 'text-signal-blue' }
      case 'bip-bip':
        return { label: 'Bip-Bip (Lelah 10m)', color: 'text-rose-500 font-bold' }
      case 'ting-tong':
        return { label: 'Ting-Tong (Istirahat 20s)', color: 'text-amber-500 font-bold' }
      case 'pop-pop':
        return { label: 'Pop-Pop (Mata Kering)', color: 'text-sky-500' }
      case 'ta-da':
        return { label: 'Ta-Da (Istirahat Selesai)', color: 'text-emerald-500 font-bold' }
      case 'none':
      default:
        return { label: 'Senyap (Silent)', color: 'text-text-muted' }
    }
  }

  const formatSec = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    if (mins > 0) return `${mins}m ${s}s`
    return `${s}s`
  }

  const lcd = getLcdConfig(lcdCommand)
  const speaker = getSpeakerConfig(speakerCommand)

  return (
    <div className="card-sm p-6 space-y-6 relative overflow-hidden border border-border/80 shadow-sm">
      {/* Decorative Blur Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-signal-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Stream Status Aktuator Robot</h3>
            <p className="text-[11px] text-text-muted">Visualisasi layar LCD & Efek Suara Speaker SocaSob</p>
          </div>
        </div>

        {/* Status Indikator Server ML */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5',
            isConnected || mlWsConnected
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-surface-2 text-text-muted border-border'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', isConnected || mlWsConnected ? 'bg-emerald-500' : 'bg-text-muted')} />
            {isConnected || mlWsConnected ? 'Aktuator Sync' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Grid Utama: Display LCD & Speaker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visualisasi Layar LCD Robot */}
        <div className={cn('p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4', lcd.faceBg)}>
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">

              STATUS EKSPRESI LCD
            </span>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', lcd.badgeColor)}>
              {lcdCommand}
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-surface/90 border border-border/80 flex items-center justify-center text-4xl shadow-inner shrink-0">
              {lcd.emoji}
            </div>
            <div>
              <p className="text-base font-extrabold text-text tracking-tight">{lcd.label}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{lcd.desc}</p>
            </div>
          </div>
        </div>

        {/* Status Speaker & Audio Feedback */}
        <div className="p-5 rounded-2xl bg-surface-1/70 border border-border/70 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
              {speakerCommand !== 'none' ? <Volume2 className="w-3.5 h-3.5 text-signal-blue" /> : <VolumeX className="w-3.5 h-3.5 text-text-muted" />}
              EFEK SUARA SPEAKER
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-2 text-text-muted uppercase border border-border">
              Speaker Output
            </span>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2">
              <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', speakerCommand !== 'none' ? 'bg-signal-blue animate-pulse' : 'bg-border')} />
              <span className={cn('text-sm font-bold', speaker.color)}>{speaker.label}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {speakerCommand !== 'none'
                ? `Aktuator memutar audio feedback: ${speakerCommand}`
                : 'Perangkat tidak sedang memutar sinyal audio.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Time Monitoring (Pemantauan Waktu Real-Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-signal-blue/10 border border-signal-blue/20 flex items-center justify-center text-signal-blue shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-muted uppercase">Total Tatap Layar</p>
            <p className="text-sm font-extrabold text-text font-mono mt-0.5">{formatSec(workElapsedSec)}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-muted uppercase">Durasi Lelah Beruntun</p>
            <p className="text-sm font-extrabold text-amber-500 font-mono mt-0.5">{formatSec(fatigueDurationSec)}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-muted uppercase">Sisa Waktu Istirahat 20s</p>
            <p className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">
              {breakRemainingSec > 0 ? `${breakRemainingSec}s` : '0s (Siap)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
