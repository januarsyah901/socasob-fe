import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TimerDisplay } from '@/components/timer-display'
import { EyeMetrics } from '@/components/eye-metrics'
import Link from 'next/link'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Atmospheric Illustration Card (Hero) */}
        <section className="relative overflow-hidden rounded-3xl min-h-[380px] bg-gradient-to-br from-indigo-950 via-slate-900 to-cerulean flex items-center p-8 md:p-16 lg:p-20 shadow-subtle-3 border border-mist/20">
          {/* Hand-painted digital style SVG illustration elements */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
            {/* Moonlit sky and stars illustration */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="twilightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1f1f29" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0081c0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#41a1cf" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#twilightGrad)" />
              {/* Moon */}
              <circle cx="85%" cy="25%" r="40" fill="#fefffc" opacity="0.95" filter="blur(1px)" />
              <circle cx="82%" cy="25%" r="40" fill="#1f1f29" opacity="0.95" />
              {/* Star sparkles */}
              <circle cx="20%" cy="30%" r="1" fill="#ffffff" />
              <circle cx="45%" cy="15%" r="1.5" fill="#ffffff" opacity="0.8" />
              <circle cx="60%" cy="40%" r="1" fill="#ffffff" opacity="0.5" />
              <circle cx="75%" cy="10%" r="2" fill="#ffffff" />
              {/* Simple painterly hills/meadow lines */}
              <path d="M0 320 C 300 280, 600 350, 1200 300 L1200 400 L0 400 Z" fill="#282834" opacity="0.3" />
              <path d="M0 340 C 400 360, 800 310, 1200 350 L1200 400 L0 400 Z" fill="#1f1f29" opacity="0.5" />
            </svg>
          </div>

          {/* Frosted Hero Overlay Card */}
          <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/15 rounded-3xl p-6 md:p-10 max-w-xl text-white shadow-subtle-3">
            <span className="text-xs font-bold font-af text-signal-blue uppercase tracking-widest">
              Sistem Pantau Pintar
            </span>
            <h1 className="font-ppmondwest text-3xl md:text-4xl lg:text-[48px] text-white font-normal leading-[1.1] tracking-tight mt-2 mb-4">
              Pantau Pandangan, Sayangi Netra.
            </h1>
            <p className="font-af text-sm md:text-base text-white/80 leading-relaxed mb-6">
              SocaSob mendeteksi jarak tatap mata dan memberikan peringatan berkala untuk menjaga penglihatan Anda dari risiko kelelahan dan miopia.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/60 rounded-lg px-4 py-2 hover:bg-white/10 transition-all"
            >
              <span>Hubungkan Kamera</span>
              <span className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center text-[10px]">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* 6+6 Layout Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Greeting Box - styled as a White Content Card */}
          <div className="bg-paper border border-mist shadow-subtle rounded-xl p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-linen border border-mist p-1 shadow-sm">
                <Image
                  src="/images/socasob-mascot.png"
                  alt="SocaSob Mascot"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-ppmondwest text-3xl text-graphite font-normal tracking-tight">
                  Halo, Sobat Soca!
                </h2>
                <p className="font-af text-sm text-ash leading-relaxed mt-2">
                  Mari pelihara kebiasaan menatap layar yang sehat. Anda dapat memantau durasi tatap dekat dan status mata secara real-time di panel ini.
                </p>
              </div>
            </div>

            <div className="border-t border-mist/30 pt-4 mt-6">
              <Link 
                href="/log" 
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-signal-blue hover:underline"
              >
                <span>Lihat histori monitoring lengkap</span>
                <span className="text-[10px]">→</span>
              </Link>
            </div>
          </div>

          {/* Timer Display Card */}
          <TimerDisplay />
        </section>

        {/* Eye Health Metrics Section */}
        <section className="border-t border-mist/40 pt-8">
          <div className="max-w-xl">
            <h2 className="font-ppmondwest text-2xl md:text-3xl text-graphite font-normal tracking-tight">
              Kondisi Penglihatan Real-Time
            </h2>
            <p className="font-af text-sm text-ash mt-1">
              Data di bawah ini disinkronkan secara langsung dari detektor kamera SocaSob Anda.
            </p>
          </div>
          <EyeMetrics />
        </section>
      </div>
    </DashboardLayout>
  )
}