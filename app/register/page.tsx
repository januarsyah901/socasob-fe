'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
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
    dateOfBirth: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      setError('Nama, email, dan password wajib diisi.');
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
        dateOfBirth: form.dateOfBirth || undefined
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-socasob.png" alt="SocaSob" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-text">Buat Akun SocaSob</h1>
          <p className="text-text-secondary text-sm mt-1">
            Mulai jaga kesehatan mata Anda hari ini
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nama lengkap Anda"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 karakter"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-bg text-text placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Konfirmasi Password <span className="text-red-400">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {/* Divider — Data Opsional */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary">Data Tambahan (Opsional)</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition text-sm mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Mendaftarkan...' : 'Buat Akun'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-text-secondary mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
