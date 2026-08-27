'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  fetchAdminRobots,
  createAdminRobot,
  updateAdminRobot,
  deleteAdminRobot,
  unpairAdminRobot,
  type CreateRobotPayload,
} from '@/lib/admin-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Pencil,
  Trash2,
  Unlink,
  Loader2,
  RefreshCw,
  Bot,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Robot {
  _id: string;
  robotId: string;
  name: string;
  serialNumber?: string;
  status: 'active' | 'inactive';
  ipAddress?: string;
  description?: string;
  apiKey?: string;
  ownerId?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  isOnline?: boolean;
  createdAt: string;
}

const EMPTY_FORM: CreateRobotPayload = {
  robotId: '',
  name: '',
  serialNumber: '',
  ipAddress: '',
  description: '',
  status: 'active',
};

export function AdminRobotsTab() {
  const { getToken } = useAuth();
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editRobot, setEditRobot] = useState<Robot | null>(null);
  const [form, setForm] = useState<CreateRobotPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Robot | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminRobots(token);
      setRobots(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditRobot(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (robot: Robot) => {
    setEditRobot(robot);
    setForm({
      robotId: robot.robotId,
      name: robot.name,
      serialNumber: robot.serialNumber || '',
      ipAddress: robot.ipAddress || '',
      description: robot.description || '',
      status: robot.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.robotId.trim() || !form.name.trim()) {
      setFormError('Robot ID dan Nama wajib diisi.');
      return;
    }
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setFormError('');
    try {
      if (editRobot) {
        await updateAdminRobot(token, editRobot.robotId, form);
      } else {
        await createAdminRobot(token, form);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    try {
      await deleteAdminRobot(token, deleteTarget.robotId);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleUnpair = async (robot: Robot) => {
    const token = getToken();
    if (!token) return;
    try {
      await unpairAdminRobot(token, robot.robotId);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text">Daftar Robot</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4" />
            Tambah Robot
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat data robot...</span>
          </div>
        ) : robots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-3">
            <Bot className="w-10 h-10 opacity-40" />
            <p className="text-sm">Belum ada robot terdaftar</p>
            <Button onClick={openCreate} size="sm">
              <Plus className="w-4 h-4" />
              Tambah Robot Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Robot
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Serial / IP
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                    Pemilik
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {robots.map((robot) => (
                  <tr key={robot._id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            robot.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                          )}
                        />
                        <div>
                          <p className="font-semibold text-text">{robot.name}</p>
                          <p className="text-xs text-text-muted font-mono">{robot.robotId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-text">
                        {robot.serialNumber || <span className="text-text-muted italic">—</span>}
                      </p>
                      <p className="text-xs text-text-muted">{robot.ipAddress || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {robot.ownerId ? (
                        <div>
                          <p className="font-medium text-text text-xs">{robot.ownerId.fullName}</p>
                          <p className="text-xs text-text-muted">{robot.ownerId.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">Belum dipasang</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                          robot.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-500/10 text-slate-500'
                        )}
                      >
                        {robot.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {robot.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {robot.ownerId && (
                          <button
                            onClick={() => handleUnpair(robot)}
                            title="Lepas Pairing"
                            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(robot)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-signal-blue/10 text-signal-blue hover:text-signal-blue/80 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(robot)}
                          title="Hapus"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editRobot ? `Edit Robot — ${editRobot.name}` : 'Tambah Robot Baru'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Robot ID *"
              value={form.robotId}
              onChange={(e) => setForm((f) => ({ ...f, robotId: e.target.value }))}
              placeholder="cth: esp32-cam-01"
              disabled={!!editRobot}
            />
            <Input
              label="Nama Robot *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="cth: Kamera Kamar"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Serial Number"
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
              placeholder="cth: SOCA-X7B9 (auto jika kosong)"
            />
            <Input
              label="IP Address"
              value={form.ipAddress}
              onChange={(e) => setForm((f) => ({ ...f, ipAddress: e.target.value }))}
              placeholder="cth: 192.168.1.100"
            />
          </div>
          <Input
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Opsional — keterangan tambahan"
          />
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Status</label>
            <div className="flex gap-3">
              {(['active', 'inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer',
                    form.status === s
                      ? s === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/40'
                      : 'text-text-muted border-border hover:bg-surface-2'
                  )}
                >
                  {s === 'active' ? 'Aktif' : 'Nonaktif'}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-red-500 text-xs bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} size="sm">
              Batal
            </Button>
            <Button onClick={handleSave} loading={saving} size="sm">
              {editRobot ? 'Simpan Perubahan' : 'Tambah Robot'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus Robot"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Apakah Anda yakin ingin menghapus robot{' '}
            <strong className="text-text">{deleteTarget?.name}</strong> (
            <span className="font-mono text-xs">{deleteTarget?.robotId}</span>)? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} size="sm">
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} size="sm">
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
