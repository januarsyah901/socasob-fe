'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      setError('Nama lengkap, email, dan password wajib diisi.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-signal-blue/10 mb-3 border border-signal-blue/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-socasob.webp" alt="SocaSob" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight font-figtree">
            Buat Akun SocaSob
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Mulai pantau dan jaga kesehatan mata Anda hari ini
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Top Tab Switcher: Masuk & Daftar */}
          <div className="grid grid-cols-2 bg-surface-2 p-1 rounded-xl mb-6 border border-border">
            <Link
              href="/login"
              className="py-2 text-center text-xs sm:text-sm font-semibold rounded-lg text-text-muted hover:text-text hover:bg-surface/50 transition-all flex items-center justify-center gap-1.5"
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </Link>
            <Link
              href="/register"
              className="py-2 text-center text-xs sm:text-sm font-bold rounded-lg bg-surface text-signal-blue shadow-xs transition-all flex items-center justify-center gap-1.5"
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

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Nama Lengkap <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nama lengkap Anda"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Email <span className="text-error">*</span>
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
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 karakter"
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

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Konfirmasi Password <span className="text-error">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
              />
            </div>

            {/* Divider — Data Opsional */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Data Tambahan (Opsional)
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30 focus:border-signal-blue transition"
              />
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
                <UserPlus size={16} />
              )}
              {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Secondary Switch Action */}
          <div className="mt-6 pt-5 border-t border-border text-center space-y-3">
            <p className="text-xs text-text-muted">
              Sudah memiliki akun SocaSob terdaftar?
            </p>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:border-signal-blue/40 bg-surface-2 hover:bg-surface-2/80 text-text font-semibold text-xs sm:text-sm transition-all shadow-2xs"
            >
              <LogIn size={15} className="text-signal-blue" />
              <span>Masuk ke Akun Saya</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
