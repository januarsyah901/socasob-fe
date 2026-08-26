'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard — Bungkus halaman yang butuh login.
 * Kalau belum login, otomatis redirect ke /login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Tampilkan loading spinner saat restoring session dari localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  // Belum autentikasi — jangan render children (redirect sedang berjalan)
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
