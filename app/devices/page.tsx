'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Trash2,
  Wifi,
  WifiOff,
  Radio,
  Activity,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Link2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Loader2,
  Unlink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { useSocket, beApi } from '@/lib/socket-context'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface RobotDevice {
  _id?: string
  robotId: string
  serialNumber?: string
  name: string
  status: 'active' | 'inactive'
  ipAddress?: string
  description?: string
  lastSeenAt?: string | null
  isOnline?: boolean
  createdAt?: string
  ownerId?: string
}

export default function DevicesPage() {
  const { robotId: activeRobotId, setRobotId } = useSocket()
  const { user, getToken } = useAuth()

  const [robots, setRobots] = useState<RobotDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State: Pair robot
  const [serialInput, setSerialInput] = useState('')
  const [isPairing, setIsPairing] = useState(false)
  const [pairError, setPairError] = useState('')

  // Modal: Unpair
  const [isUnpairModalOpen, setIsUnpairModalOpen] = useState(false)
  const [unpairingRobot, setUnpairingRobot] = useState<RobotDevice | null>(null)
  const [isUnpairing, setIsUnpairing] = useState(false)

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Fetch hanya robot milik user yang sedang login
  const fetchMyRobots = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      // GET /api/robots → sudah inject token via beApi, backend filter by ownerId
      const res = await beApi('/api/robots')
      if (res.success && Array.isArray(res.data)) {
        // Filter hanya robot milik user ini
        const myRobots = res.data.filter(
          (r: RobotDevice) => r.ownerId && r.ownerId === user?._id
        )
        setRobots(myRobots)
        // Auto-pilih robot pertama jika belum ada yang aktif
        if (!activeRobotId && myRobots.length > 0) {
          setRobotId(myRobots[0].robotId)
        }
      } else {
        setErrorMsg(res.error || 'Gagal memuat daftar perangkat.')
      }
    } catch (err: unknown) {
      setErrorMsg('Gagal terhubung ke server: ' + (err instanceof Error ? err.message : err))
    } finally {
      setIsLoading(false)
    }
  }, [activeRobotId, setRobotId, user?._id])

  useEffect(() => {
    fetchMyRobots()
    const interval = setInterval(fetchMyRobots, 15000)
    return () => clearInterval(interval)
  }, [fetchMyRobots])

  // Pair robot via Serial Number
  const handlePairRobot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serialInput.trim()) {
      setPairError('Serial Number wajib diisi.')
      return
    }
    setPairError('')
    setIsPairing(true)
    try {
      const token = getToken()
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz'
      const res = await fetch(`${API_BASE}/api/auth/pair-robot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serialNumber: serialInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Pairing gagal')
      showSuccess(json.message)
      setSerialInput('')
      fetchMyRobots()
    } catch (err: unknown) {
      setPairError(err instanceof Error ? err.message : 'Pairing gagal')
    } finally {
      setIsPairing(false)
    }
  }

  // Unpair robot
  const handleConfirmUnpair = async () => {
    if (!unpairingRobot) return
    setIsUnpairing(true)
    try {
      const token = getToken()
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz'
      const res = await fetch(`${API_BASE}/api/auth/unpair-robot`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serialNumber: unpairingRobot.serialNumber }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unpair gagal')
      showSuccess(json.message)
      setIsUnpairModalOpen(false)
      // Reset robot aktif jika yang di-unpair adalah yang sedang dipantau
      if (activeRobotId === unpairingRobot.robotId) setRobotId('')
      fetchMyRobots()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unpair gagal')
    } finally {
      setIsUnpairing(false)
    }
  }

  const onlineCount = robots.filter((r) => r.isOnline).length

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <PageHeader
            title="Perangkat Robot Saya"
            subtitle="Robot yang terhubung ke akun Anda akan tampil di sini. Gunakan Serial Number untuk menghubungkan robot baru."
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchMyRobots}
            disabled={isLoading}
            className="gap-1.5 shrink-0 self-start"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-emerald-800 dark:text-emerald-300 text-sm font-semibold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-rose-800 dark:text-rose-300 text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-signal-blue/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-signal-blue" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Total Robot Terhubung</p>
              <p className="text-2xl font-bold text-text leading-tight mt-0.5">{robots.length}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Robot Online (Live)</p>
              <p className="text-2xl font-bold text-emerald-500 leading-tight mt-0.5">{onlineCount}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-active-teal/10 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 text-active-teal" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Robot Aktif Dipantau</p>
              <p className="text-sm font-bold text-text truncate max-w-[160px] mt-0.5">
                {activeRobotId ? (
                  <span className="font-mono text-signal-blue">{activeRobotId}</span>
                ) : (
                  <span className="text-text-muted">Belum dipilih</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Card: Hubungkan Robot Baru */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-4.5 h-4.5 text-signal-blue" />
            <h2 className="text-sm font-bold text-text">Hubungkan Robot Baru</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">
            Masukkan Serial Number yang tertera di bawah badan robot atau di buku panduan (contoh: <span className="font-mono font-semibold">SOCA-TEST</span>).
          </p>
          {pairError && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700 rounded-xl p-3 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="text-rose-800 dark:text-rose-300 text-xs font-semibold">{pairError}</p>
            </div>
          )}
          <form onSubmit={handlePairRobot} className="flex gap-3">
            <input
              type="text"
              value={serialInput}
              onChange={(e) => { setSerialInput(e.target.value.toUpperCase()); setPairError('') }}
              placeholder="Contoh: SOCA-X7B9"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition uppercase tracking-widest font-mono"
            />
            <button
              type="submit"
              disabled={isPairing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-signal-blue hover:bg-signal-blue/90 disabled:opacity-60 text-white font-semibold text-sm transition shrink-0"
            >
              {isPairing ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {isPairing ? 'Menghubungkan...' : 'Hubungkan'}
            </button>
          </form>
        </div>

        {/* Daftar Robot Milik User */}
        <div className="card-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-signal-blue" />
              <h2 className="text-base font-semibold text-text">Robot Milik Saya</h2>
            </div>
            <span className="text-xs text-text-muted">{robots.length} robot terhubung</span>
          </div>

          {isLoading && robots.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-signal-blue" />
              <p className="text-sm">Memuat perangkat...</p>
            </div>
          ) : robots.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Belum ada robot yang terhubung"
              description="Masukkan Serial Number robot di form di atas untuk menghubungkan robot pertama Anda."
            />
          ) : (
            <div className="divide-y divide-border">
              {robots.map((robot) => {
                const isSelected = activeRobotId === robot.robotId
                return (
                  <div
                    key={robot.robotId}
                    className={cn(
                      'p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors',
                      isSelected ? 'bg-signal-blue/5' : 'hover:bg-surface-2/40'
                    )}
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                          robot.isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-2 text-text-muted'
                        )}
                      >
                        <Bot className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-text">{robot.name}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-surface-2 border border-border text-text-muted">
                            ID: {robot.robotId}
                          </span>
                          {robot.serialNumber && (
                            <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-signal-blue/10 border border-signal-blue/20 text-signal-blue">
                              SN: {robot.serialNumber}
                            </span>
                          )}
                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-signal-blue text-white font-semibold">
                              <Check className="w-3 h-3" /> Aktif Dipantau
                            </span>
                          )}
                        </div>

                        {robot.description && (
                          <p className="text-xs text-text-muted">{robot.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                          <div className="flex items-center gap-1.5">
                            {robot.isOnline ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-emerald-500 font-medium">Online</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-border" />
                                <span>Offline</span>
                              </>
                            )}
                          </div>

                          {robot.ipAddress && (
                            <div className="flex items-center gap-1">
                              <Wifi className="w-3.5 h-3.5 text-text-muted" />
                              <span className="font-mono">{robot.ipAddress}</span>
                            </div>
                          )}

                          {robot.status === 'inactive' && (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold text-xs">
                              Nonaktif
                            </span>
                          )}

                          {robot.lastSeenAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-text-muted" />
                              <span>
                                Terakhir: {new Date(robot.lastSeenAt).toLocaleTimeString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {!isSelected ? (
                        <button
                          onClick={() => {
                            setRobotId(robot.robotId)
                            showSuccess(`Sekarang memantau '${robot.name}'`)
                          }}
                          className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 transition-colors"
                        >
                          Pilih untuk Dipantau
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-signal-blue/10 text-signal-blue text-xs font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Sedang Dipantau
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setUnpairingRobot(robot)
                          setIsUnpairModalOpen(true)
                        }}
                        className="p-2 rounded-xl text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Lepas koneksi robot"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            <strong className="text-text">Serial Number</strong> adalah kode unik yang tertera di
            bawah badan robot atau di buku panduan (contoh: <span className="font-mono">SOCA-TEST</span>).
            Untuk menambah robot ke akun, masukkan Serial Number di form di atas.{' '}
            <Link href="/settings" className="text-signal-blue hover:underline font-medium">
              Kelola juga di halaman Pengaturan →
            </Link>
          </div>
        </div>

        {/* Modal: Konfirmasi Unpair */}
        <Modal
          open={isUnpairModalOpen}
          onClose={() => setIsUnpairModalOpen(false)}
          title="Lepas Koneksi Robot"
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-text-muted leading-relaxed">
              Apakah Anda yakin ingin melepas robot{' '}
              <strong className="text-text">{unpairingRobot?.name}</strong>{' '}
              (<span className="font-mono text-xs">{unpairingRobot?.serialNumber}</span>) dari akun Anda?
            </p>
            <p className="text-xs text-rose-500">
              Robot tidak akan mengirim data ke akun Anda setelah dilepas. Anda bisa menghubungkannya lagi kapan saja.
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsUnpairModalOpen(false)}
                disabled={isUnpairing}
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleConfirmUnpair}
                disabled={isUnpairing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold text-sm transition"
              >
                {isUnpairing ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                {isUnpairing ? 'Melepas...' : 'Ya, Lepas Robot'}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  )
}
