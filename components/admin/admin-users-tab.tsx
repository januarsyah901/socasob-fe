'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  fetchAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from '@/lib/admin-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Loader2,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  phoneNumber?: string;
  createdAt: string;
}

interface UsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

function RoleChip({ role }: { role: 'admin' | 'user' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
        role === 'admin'
          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
          : 'bg-signal-blue/10 text-signal-blue border border-signal-blue/20'
      )}
    >
      {role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

export function AdminUsersTab() {
  const { getToken, user: currentUser } = useAuth();
  const [result, setResult] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Role change confirm
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [changingRole, setChangingRole] = useState(false);

  const load = useCallback(
    async (p = page) => {
      const token = getToken();
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetchAdminUsers(token, p, 15);
        setResult(res);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [getToken, page]
  );

  useEffect(() => {
    load(page);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    try {
      await deleteAdminUser(token, deleteTarget._id);
      setDeleteTarget(null);
      await load(page);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleToggle = async () => {
    if (!roleTarget) return;
    const token = getToken();
    if (!token) return;
    setChangingRole(true);
    const newRole = roleTarget.role === 'admin' ? 'user' : 'admin';
    try {
      await updateAdminUserRole(token, roleTarget._id, newRole);
      setRoleTarget(null);
      await load(page);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setChangingRole(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const users = result?.data || [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text">
          Daftar Pengguna
          {result?.total !== undefined && (
            <span className="ml-2 text-sm text-text-muted font-normal">({result.total} total)</span>
          )}
        </h2>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
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
            <span className="text-sm">Memuat data pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Tidak Ada Pengguna Ditemukan"
            description="Belum ada data pengguna yang terdaftar di dalam sistem."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Pengguna
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">
                    No. Telepon
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                    Daftar Sejak
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isSelf = u._id === (currentUser as any)?._id;
                  return (
                    <tr key={u._id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{u.fullName}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-text-muted">
                          {u.phoneNumber || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleChip role={u.role} />
                        {isSelf && (
                          <span className="ml-1 text-[10px] text-text-muted">(Anda)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-text-muted">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setRoleTarget(u)}
                                title={u.role === 'admin' ? 'Turunkan ke User' : 'Jadikan Admin'}
                                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Hapus User"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-text-muted">
            Halaman <strong className="text-text">{page}</strong> dari{' '}
            <strong className="text-text">{result.totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
            disabled={page === result.totalPages}
            className="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus User"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Apakah Anda yakin ingin menghapus pengguna{' '}
            <strong className="text-text">{deleteTarget?.fullName}</strong> (
            <span className="text-xs">{deleteTarget?.email}</span>)? Semua robot miliknya akan
            dilepas pairingnya.
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

      {/* Role Change Confirm Modal */}
      <Modal
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title="Konfirmasi Ubah Role"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Ubah role <strong className="text-text">{roleTarget?.fullName}</strong> dari{' '}
            <strong>{roleTarget?.role === 'admin' ? 'Admin' : 'User'}</strong> menjadi{' '}
            <strong>{roleTarget?.role === 'admin' ? 'User' : 'Admin'}</strong>?
          </p>
          {roleTarget?.role === 'user' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              ⚠️ Memberikan akses Admin akan memberi pengguna ini kendali penuh atas sistem.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRoleTarget(null)} size="sm">
              Batal
            </Button>
            <Button onClick={handleRoleToggle} loading={changingRole} size="sm">
              Konfirmasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
