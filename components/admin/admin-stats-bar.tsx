'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchAdminStats } from '@/lib/admin-api';
import { Users, Bot, Activity, Link2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalRobots: number;
  activeRobots: number;
  pairedRobots: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] text-text-muted font-medium uppercase tracking-wide">{label}</p>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-text-muted mt-1" />
        ) : (
          <p className="text-2xl font-extrabold text-text leading-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

export function AdminStatsBar() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchAdminStats(token)
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getToken]);

  const items = [
    {
      label: 'Total User',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-signal-blue/10 text-signal-blue',
    },
    {
      label: 'Total Robot',
      value: stats?.totalRobots ?? 0,
      icon: Bot,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: 'Robot Aktif',
      value: stats?.activeRobots ?? 0,
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      label: 'Sudah Dipasang',
      value: stats?.pairedRobots ?? 0,
      icon: Link2,
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <StatCard key={item.label} {...item} loading={loading} />
      ))}
    </div>
  );
}
