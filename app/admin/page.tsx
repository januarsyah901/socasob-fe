'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AdminGuard } from '@/components/admin-guard';
import { AdminRobotsTab } from '@/components/admin/admin-robots-tab';
import { AdminUsersTab } from '@/components/admin/admin-users-tab';
import { AdminMlTab } from '@/components/admin/admin-ml-tab';
import { AdminStatsBar } from '@/components/admin/admin-stats-bar';
import { cn } from '@/lib/utils';
import { Bot, Users, Cpu, LayoutDashboard } from 'lucide-react';

const TABS = [
  { id: 'robots', label: 'Manajemen Robot', icon: Bot },
  { id: 'users', label: 'Manajemen User', icon: Users },
  { id: 'ml', label: 'Konfigurasi ML', icon: Cpu },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('robots');

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight leading-tight font-figtree">
              Pusat Kendali Sistem
            </h1>
            <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
              Kelola robot, pengguna, dan konfigurasi ML server dari satu tempat.
            </p>
          </div>

          {/* Stats Bar */}
          <AdminStatsBar />

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-surface rounded-2xl w-fit border border-border">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
                    active
                      ? 'bg-signal-blue text-white shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'robots' && <AdminRobotsTab />}
            {activeTab === 'users' && <AdminUsersTab />}
            {activeTab === 'ml' && <AdminMlTab />}
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
