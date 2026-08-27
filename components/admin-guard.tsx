'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ShieldOff } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard — Hanya izinkan user dengan role 'admin'.
 * Redirect ke /login jika belum login, tampilkan error jika bukan admin.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-signal-blue" />
          <p className="text-sm">Memuat sesi admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Cek role admin
  if ((user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <ShieldOff className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-text">Akses Ditolak</h1>
          <p className="text-sm text-text-muted">
            Halaman ini hanya bisa diakses oleh Administrator. Hubungi tim support jika Anda
            seharusnya memiliki akses.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-2xl bg-signal-blue text-white text-sm font-bold hover:bg-signal-blue/90 transition-colors cursor-pointer"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
