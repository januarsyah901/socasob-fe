'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-socasob.png" alt="SocaSob" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-text">Masuk ke SocaSob</h1>
          <p className="text-text-secondary text-sm mt-1">
            Pantau kesehatan mata Anda kapan saja
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-text-secondary mt-5">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
