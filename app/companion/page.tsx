'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { CompanionChat } from '@/components/companion/companion-chat'

export default function CompanionPage() {
  return (
    <DashboardLayout fullWidth>
      <div className="max-w-6xl mx-auto">
        <CompanionChat />
      </div>
    </DashboardLayout>
  )
}
