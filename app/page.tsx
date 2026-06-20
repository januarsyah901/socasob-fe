import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TimerDisplay } from '@/components/timer-display'
import { EyeMetrics } from '@/components/eye-metrics'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Greeting */}
        <div className="bg-gradient-to-r rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl">
        <Image
          src="/images/socasob-mascot.png"
          alt="SocaSob Mascot"
          fill
          className="object-cover"
        />
      </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-black">Halo, Sobat Soca!</h1>
            <p className="text-gray-700 dark:text-black-300 mt-1">Sobat Soca bisa memantau penggunaan gadget di sini.</p>
          </div>
        </div>

        {/* Timer Section */}
        <TimerDisplay />

        {/* Eye Metrics Section */}
        <EyeMetrics />
      </div>
    </DashboardLayout>
  )
}