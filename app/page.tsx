import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TimerDisplay } from '@/components/timer-display'
import { EyeMetrics } from '@/components/eye-metrics'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="relative z-0 min-h-[calc(100vh-80px)] overflow-hidden p-6 md:p-8">
        {/* Page Background Layer (terang) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-100/50 to-blue-50/30 z-[-20] pointer-events-none"></div>
        
        {/* Logo Watermark Background */}
        <div className="absolute inset-0 z-[-15] pointer-events-none flex items-center justify-center opacity-10">
          <Image
            src="/images/Logo Socasob.png"
            alt="Socasob Logo Watermark"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        
        {/* Decorative Ambient Glass Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl z-[-10] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl z-[-10] pointer-events-none"></div>
        <div className="absolute top-1/2 right-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl z-[-10] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Greeting */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white/50 p-1 border border-white/40 shadow-sm">
              <Image
                src="/images/socasob-mascot.png"
                alt="SocaSob Mascot"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Halo, Sobat Soca!</h1>
              <p className="text-gray-600 mt-1">Sobat Soca bisa memantau penggunaan gadget di sini.</p>
            </div>
          </div>

          {/* Timer Section */}
          <TimerDisplay />

          {/* Eye Metrics Section */}
          <EyeMetrics />
        </div>
      </div>
    </DashboardLayout>
  )
}