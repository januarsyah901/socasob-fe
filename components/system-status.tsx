'use client'

import { useSocket } from '@/lib/socket-context'
import { Activity, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SystemStatus() {
  const { isConnected } = useSocket()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="card-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isConnected ? "bg-active-teal/10 text-active-teal" : "bg-text-muted/10 text-text-muted")}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sistem Monitoring</p>
            <p className="text-sm font-bold text-text">{isConnected ? 'Aktif' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-active-teal" : "bg-text-muted")} />
        </div>
      </div>

      <div className="card-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isConnected ? "bg-success/10 text-success" : "bg-text-muted/10 text-text-muted")}>
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Kamera Sensor</p>
            <p className="text-sm font-bold text-text">{isConnected ? 'Terhubung' : 'Terputus'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-success" : "bg-text-muted")} />
        </div>
      </div>
    </div>
  )
}
