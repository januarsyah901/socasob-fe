'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-signal-blue/10 mb-3 border border-signal-blue/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-socasob.webp" alt="SocaSob" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight font-figtree">
            Masuk ke SocaSob
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Pantau kesehatan mata dan ergonomi visual Anda
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Top Tab Switcher: Masuk & Daftar */}
          <div className="grid grid-cols-2 bg-surface-2 p-1 rounded-xl mb-6 border border-border">
            <Link
              href="/login"
              className="py-2 text-center text-xs sm:text-sm font-bold rounded-lg bg-surface text-signal-blue shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </Link>
            <Link
              href="/register"
              className="py-2 text-center text-xs sm:text-sm font-semibold rounded-lg text-text-muted hover:text-text hover:bg-surface/50 transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>Daftar</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-signal-blue hover:bg-signal-blue/90 active:bg-signal-blue/85 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-sm cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Masuk ke Akun...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Secondary Switch Action */}
          <div className="mt-6 pt-5 border-t border-border text-center space-y-3">
            <p className="text-xs text-text-muted">
              Belum memiliki akun SocaSob?
            </p>
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:border-signal-blue/40 bg-surface-2 hover:bg-surface-2/80 text-text font-semibold text-xs sm:text-sm transition-all shadow-2xs"
            >
              <UserPlus size={15} className="text-signal-blue" />
              <span>Daftar Akun Baru</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
