'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Plus,
  Trash2,
  Edit3,
  Wifi,
  WifiOff,
  Radio,
  Activity,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useSocket, beApi } from '@/lib/socket-context'

interface RobotDevice {
  _id?: string
  robotId: string
  name: string
  status: 'active' | 'inactive'
  ipAddress?: string
  description?: string
  apiKey?: string
  lastSeenAt?: string | null
  isOnline?: boolean
  createdAt?: string
}

export default function DevicesPage() {
  const { robotId: activeRobotId, setRobotId } = useSocket()
  const [robots, setRobots] = useState<RobotDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal State: Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRobotId, setNewRobotId] = useState('')
  const [newName, setNewName] = useState('')
  const [newIp, setNewIp] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Modal State: Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRobot, setEditingRobot] = useState<RobotDevice | null>(null)
  const [editName, setEditName] = useState('')
  const [editIp, setEditIp] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')

  // Modal State: Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingRobot, setDeletingRobot] = useState<RobotDevice | null>(null)

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const fetchRobots = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await beApi('/api/robots')
      if (res.success && Array.isArray(res.data)) {
        setRobots(res.data)
        // Jika belum ada robot aktif yang dipilih, pilih robot pertama
        if (!activeRobotId && res.data.length > 0) {
          setRobotId(res.data[0].robotId)
        }
      } else {
        setErrorMsg(res.error || 'Gagal memuat daftar perangkat.')
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server Backend: ' + (err.message || err))
    } finally {
      setIsLoading(false)
    }
  }, [activeRobotId, setRobotId])

  useEffect(() => {
    fetchRobots()
    // Poll status online tiap 15 detik
    const interval = setInterval(fetchRobots, 15000)
    return () => clearInterval(interval)
  }, [fetchRobots])

  // Handle Tambah Robot
  const handleAddRobot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRobotId.trim()) {
      setFormError('ID Robot wajib diisi.')
      return
    }
    if (!newName.trim()) {
      setFormError('Nama Robot wajib diisi.')
      return
    }

    setFormError('')
    setIsSubmitting(true)

    try {
      const res = await beApi('/api/robots', {
        method: 'POST',
        body: JSON.stringify({
          robotId: newRobotId.trim(),
          name: newName.trim(),
          ipAddress: newIp.trim(),
          description: newDesc.trim(),
        }),
      })

      if (res.success) {
        showSuccess(`Robot '${res.data.name}' (${res.data.robotId}) berhasil didaftarkan!`)
        setIsAddModalOpen(false)
        setNewRobotId('')
        setNewName('')
        setNewIp('')
        setNewDesc('')
        fetchRobots()
        // Otomatis aktifkan jika belum ada yang aktif
        if (!activeRobotId) {
          setRobotId(res.data.robotId)
        }
      } else {
        setFormError(res.error || 'Gagal mendaftarkan robot.')
      }
    } catch (err: any) {
      setFormError('Terjadi kesalahan jaringan: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Edit Robot
  const handleOpenEdit = (robot: RobotDevice) => {
    setEditingRobot(robot)
    setEditName(robot.name)
    setEditIp(robot.ipAddress || '')
    setEditDesc(robot.description || '')
    setEditStatus(robot.status)
    setFormError('')
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRobot) return
    if (!editName.trim()) {
      setFormError('Nama Robot tidak boleh kosong.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const res = await beApi(`/api/robots/${editingRobot.robotId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          ipAddress: editIp.trim(),
          description: editDesc.trim(),
          status: editStatus,
        }),
      })

      if (res.success) {
        showSuccess(`Data robot '${editingRobot.robotId}' berhasil diperbarui!`)
        setIsEditModalOpen(false)
        fetchRobots()
      } else {
        setFormError(res.error || 'Gagal memperbarui robot.')
      }
    } catch (err: any) {
      setFormError('Kesalahan jaringan: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Hapus Robot
  const handleConfirmDelete = async () => {
    if (!deletingRobot) return
    setIsSubmitting(true)

    try {
      const res = await beApi(`/api/robots/${deletingRobot.robotId}`, {
        method: 'DELETE',
      })

      if (res.success) {
        showSuccess(`Robot '${deletingRobot.robotId}' berhasil dihapus.`)
        setIsDeleteModalOpen(false)
        if (activeRobotId === deletingRobot.robotId) {
          const remaining = robots.filter((r) => r.robotId !== deletingRobot.robotId)
          if (remaining.length > 0) {
            setRobotId(remaining[0].robotId)
          } else {
            setRobotId('')
          }
        }
        fetchRobots()
      } else {
        alert(res.error || 'Gagal menghapus robot.')
      }
    } catch (err: any) {
      alert('Kesalahan jaringan: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onlineCount = robots.filter((r) => r.isOnline).length
  const totalCount = robots.length

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            eyebrow="Device Provisioning"
            title="Kelola Perangkat"
            description="Daftarkan ID robot ESP32-CAM yang diizinkan untuk mengirim data deteksi mata ke sistem."
          />
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRobots}
              disabled={isLoading}
              className="gap-1.5 shrink-0"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormError('')
                setIsAddModalOpen(true)
              }}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Robot</span>
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="bg-success/10 border border-success/25 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <p className="text-success text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-error/10 border border-error/25 rounded-2xl p-4 animate-fade-in flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <p className="text-error text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-signal-blue/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-signal-blue" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Total Robot Terdaftar</p>
              <p className="text-2xl font-bold text-text leading-tight mt-0.5">{totalCount}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Robot Online (Live)</p>
              <p className="text-2xl font-bold text-success leading-tight mt-0.5">{onlineCount}</p>
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

        {/* Device Table / List */}
        <div className="card-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-signal-blue" />
              <h2 className="text-base font-semibold text-text">Daftar Perangkat Terverifikasi</h2>
            </div>
            <span className="text-xs text-text-muted">
              {robots.length} perangkat dikonfigurasi
            </span>
          </div>

          {isLoading && robots.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-signal-blue" />
              <p className="text-sm">Memuat data perangkat...</p>
            </div>
          ) : robots.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto text-text-muted">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-text">Belum ada robot yang terdaftar</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                  Daftarkan ID robot ESP32-CAM Anda agar data deteksi mata dapat diproses dan ditampilkan di dashboard.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Robot Pertama</span>
              </Button>
            </div>
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
                          robot.isOnline
                            ? 'bg-success/10 text-success'
                            : 'bg-surface-2 text-text-muted'
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
                          {isSelected && (
                            <Badge variant="primary" className="gap-1">
                              <Check className="w-3 h-3" /> Aktif Dipantau
                            </Badge>
                          )}
                        </div>

                        {robot.description && (
                          <p className="text-xs text-text-muted">{robot.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                          <div className="flex items-center gap-1.5">
                            {robot.isOnline ? (
                              <>
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" />
                                  <span className="relative rounded-full h-2 w-2 bg-success" />
                                </span>
                                <span className="text-success font-medium">Online</span>
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
                            <Badge variant="error">Nonaktif</Badge>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setRobotId(robot.robotId)
                            showSuccess(`Sekarang memantau '${robot.name}' (${robot.robotId})`)
                          }}
                          className="text-xs font-semibold"
                        >
                          Pilih untuk Dipantau
                        </Button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-signal-blue/10 text-signal-blue text-xs font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Sedang Dipantau
                        </div>
                      )}

                      <button
                        onClick={() => handleOpenEdit(robot)}
                        className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                        title="Edit Perangkat"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDeletingRobot(robot)
                          setIsDeleteModalOpen(true)
                        }}
                        className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                        title="Hapus Perangkat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-surface-2 border border-border rounded-2xl p-5 flex gap-4 items-start">
          <Info className="w-5 h-5 text-signal-blue shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            <strong className="text-text">Keamanan Koneksi:</strong> Hanya robot dengan ID yang
            terdaftar di halaman ini yang diizinkan mengirim frame ke server Machine Learning dan
            menyimpan riwayat ke database SocaSob.
          </div>
        </div>

        {/* === Modal Tambah Robot === */}
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Daftarkan Robot ESP32 Baru"
        >
          <form onSubmit={handleAddRobot} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 bg-error/10 border border-error/25 rounded-xl text-xs text-error font-medium">
                {formError}
              </div>
            )}

            <Input
              label="ID Robot (Hardware ID / Kode Unik)"
              placeholder="Contoh: fadfa566 atau robot-kamar-01"
              value={newRobotId}
              onChange={(e) => setNewRobotId(e.target.value)}
              required
            />

            <Input
              label="Nama Perangkat"
              placeholder="Contoh: SocaSob Meja Belajar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />

            <Input
              label="Alamat IP Robot (Opsional)"
              placeholder="Contoh: 192.168.1.105"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />

            <Input
              label="Deskripsi / Lokasi (Opsional)"
              placeholder="Contoh: Terpasang di laptop meja kerja"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />

            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Perangkat'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* === Modal Edit Robot === */}
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Data Robot"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 bg-error/10 border border-error/25 rounded-xl text-xs text-error font-medium">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                ID Robot (Permanen)
              </label>
              <div className="px-4 py-2.5 rounded-2xl bg-surface-2 border border-border text-sm font-mono text-text-muted">
                {editingRobot?.robotId}
              </div>
            </div>

            <Input
              label="Nama Perangkat"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <Input
              label="Alamat IP Robot"
              value={editIp}
              onChange={(e) => setEditIp(e.target.value)}
            />

            <Input
              label="Deskripsi"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Status Perangkat
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditStatus('active')}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    editStatus === 'active'
                      ? 'bg-success/10 border-success text-success'
                      : 'bg-surface-2 border-border text-text-muted hover:text-text'
                  )}
                >
                  ✓ Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('inactive')}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    editStatus === 'inactive'
                      ? 'bg-error/10 border-error text-error'
                      : 'bg-surface-2 border-border text-text-muted hover:text-text'
                  )}
                >
                  ✕ Nonaktif
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* === Modal Hapus Robot === */}
        <Modal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus Perangkat Robot"
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-text-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus robot{' '}
              <strong className="text-text">{deletingRobot?.name}</strong> (
              <span className="font-mono">{deletingRobot?.robotId}</span>)?
            </p>
            <p className="text-xs text-error">
              Setelah dihapus, robot ini tidak akan dapat mengirim data deteksi ke sistem sebelum didaftarkan kembali.
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="bg-error hover:bg-error/90"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Robot'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
