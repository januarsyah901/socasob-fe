'use client'

import { useState, useMemo } from 'react'
import {
  Clock,
  Ruler,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrendPoint {
  date: string
  screenTimeMinutes: number
  screenTimeHours: number
  dominantDistanceCm: number
  blinkRatePerMinute: number
  incompleteBlinkRatio: number
  longestContinuousGazeMinutes: number
  restCompliance: number
}

interface TrendLineChartProps {
  trend: TrendPoint[]
  robotId?: string
}

type MetricType = 'screenTime' | 'distance' | 'incompleteBlink'
type TimeRange = '7d' | '14d' | '30d' | 'all'

interface MetricConfig {
  id: MetricType
  label: string
  shortLabel: string
  unit: string
  color: string
  activeButtonClass: string
  activeIconClass: string
  statCardBorderClass: string
  statCardBgClass: string
  statValueColorClass: string
  statLabelColorClass: string
  badgeClass: string
  icon: any
  getValue: (p: TrendPoint) => number
  format: (v: number) => string
  threshold?: number
  thresholdLabel?: string
  thresholdCondition: 'below' | 'above'
  evaluate: (v: number) => { status: 'Optimal' | 'Waspada' | 'Kritis'; text: string; color: string }
}

const METRICS: Record<MetricType, MetricConfig> = {
  screenTime: {
    id: 'screenTime',
    label: 'Durasi Layar Harian',
    shortLabel: 'Screen Time',
    unit: 'Jam',
    color: '#3b82f6',
    activeButtonClass: 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm',
    activeIconClass: 'bg-blue-500 text-white shadow-xs',
    statCardBorderClass: 'border-blue-500/35 hover:border-blue-500/55',
    statCardBgClass: 'bg-blue-500/[0.05] dark:bg-blue-950/20',
    statValueColorClass: 'text-blue-600 dark:text-blue-400',
    statLabelColorClass: 'text-blue-600/80 dark:text-blue-400/80',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: Clock,
    getValue: (p) => p.screenTimeHours,
    format: (v) => `${v} Jam`,
    threshold: 4,
    thresholdLabel: 'Batas Waspada (4 Jam)',
    thresholdCondition: 'below',
    evaluate: (v) => {
      if (v <= 4) return { status: 'Optimal', text: 'Durasi aman terkendali', color: 'text-success' }
      if (v <= 6) return { status: 'Waspada', text: 'Mendekati ambang lelah mata', color: 'text-warning' }
      return { status: 'Kritis', text: 'Risiko tinggi kelelahan & miopia', color: 'text-error' }
    }
  },
  distance: {
    id: 'distance',
    label: 'Jarak Layar Dominan',
    shortLabel: 'Jarak Layar',
    unit: 'cm',
    color: '#10b981',
    activeButtonClass: 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm',
    activeIconClass: 'bg-emerald-500 text-white shadow-xs',
    statCardBorderClass: 'border-emerald-500/35 hover:border-emerald-500/55',
    statCardBgClass: 'bg-emerald-500/[0.05] dark:bg-emerald-950/20',
    statValueColorClass: 'text-emerald-600 dark:text-emerald-400',
    statLabelColorClass: 'text-emerald-600/80 dark:text-emerald-400/80',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Ruler,
    getValue: (p) => p.dominantDistanceCm,
    format: (v) => `${v} cm`,
    threshold: 30,
    thresholdLabel: 'Batas Minimal Aman (30 cm)',
    thresholdCondition: 'above',
    evaluate: (v) => {
      if (v >= 35) return { status: 'Optimal', text: 'Jarak ergonomis sangat baik', color: 'text-success' }
      if (v >= 30) return { status: 'Waspada', text: 'Batas minimal jarak aman', color: 'text-warning' }
      return { status: 'Kritis', text: 'Terlalu dekat ke layar monitor', color: 'text-error' }
    }
  },
  incompleteBlink: {
    id: 'incompleteBlink',
    label: 'Incomplete Blink Ratio',
    shortLabel: 'Kedipan Tak Sempurna',
    unit: '%',
    color: '#f59e0b',
    activeButtonClass: 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm',
    activeIconClass: 'bg-amber-500 text-white shadow-xs',
    statCardBorderClass: 'border-amber-500/35 hover:border-amber-500/55',
    statCardBgClass: 'bg-amber-500/[0.05] dark:bg-amber-950/20',
    statValueColorClass: 'text-amber-600 dark:text-amber-400',
    statLabelColorClass: 'text-amber-600/80 dark:text-amber-400/80',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Droplets,
    getValue: (p) => p.incompleteBlinkRatio,
    format: (v) => `${v}%`,
    threshold: 40,
    thresholdLabel: 'Ambang Risiko Kering (40%)',
    thresholdCondition: 'below',
    evaluate: (v) => {
      if (v < 30) return { status: 'Optimal', text: 'Kedipan menutup penuh', color: 'text-success' }
      if (v <= 40) return { status: 'Waspada', text: 'Sebagian kedipan parsial', color: 'text-warning' }
      return { status: 'Kritis', text: 'Risiko tinggi sindrom mata kering', color: 'text-error' }
    }
  }
}

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

export function TrendLineChart({ trend, robotId }: TrendLineChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('screenTime')
  const [timeRange, setTimeRange] = useState<TimeRange>('14d')

  // Filter data sesuai rentang waktu yang dipilih
  const filteredData = useMemo(() => {
    if (!trend || trend.length === 0) return []
    const sorted = [...trend].sort((a, b) => a.date.localeCompare(b.date))
    switch (timeRange) {
      case '7d':
        return sorted.slice(-7)
      case '14d':
        return sorted.slice(-14)
      case '30d':
        return sorted.slice(-30)
      case 'all':
      default:
        return sorted
    }
  }, [trend, timeRange])

  const config = METRICS[activeMetric]

  // Ringkasan statistik periode terpilih
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { avg: 0, max: 0, min: 0, trendDirection: 'flat' as const, diff: 0 }
    }
    const vals = filteredData.map(config.getValue)
    const sum = vals.reduce((acc, v) => acc + v, 0)
    const avg = Math.round((sum / vals.length) * 10) / 10
    const max = Math.max(...vals)
    const min = Math.min(...vals)

    let trendDirection: 'up' | 'down' | 'flat' = 'flat'
    let diff = 0
    if (vals.length >= 2) {
      const half = Math.floor(vals.length / 2)
      const firstHalf = vals.slice(0, half)
      const secondHalf = vals.slice(half)
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      diff = Math.round((avg2 - avg1) * 10) / 10
      if (Math.abs(diff) >= 0.2) {
        trendDirection = diff > 0 ? 'up' : 'down'
      }
    }

    return { avg, max, min, trendDirection, diff }
  }, [filteredData, config])

  // Geometri grafik SVG
  const width = 800
  const height = 280
  const padLeft = 45
  const padRight = 20
  const padTop = 30
  const padBottom = 40
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const { points, areaPath, linePath, minY, maxY, yTicks, thresholdY } = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        points: [],
        areaPath: '',
        linePath: '',
        minY: 0,
        maxY: 10,
        yTicks: [],
        thresholdY: null
      }
    }

    const rawVals = filteredData.map(config.getValue)
    const rawMin = Math.min(...rawVals)
    const rawMax = Math.max(...rawVals)

    let minY = Math.max(0, Math.floor(rawMin * 0.8))
    let maxY = Math.ceil(rawMax * 1.2)

    if (config.threshold !== undefined) {
      if (config.threshold > maxY) maxY = Math.ceil(config.threshold * 1.15)
      if (config.threshold < minY) minY = Math.max(0, Math.floor(config.threshold * 0.85))
    }

    if (maxY <= minY) maxY = minY + 10

    const pts = filteredData.map((d, i) => {
      const val = config.getValue(d)
      const x = filteredData.length === 1
        ? padLeft + plotW / 2
        : padLeft + (i / (filteredData.length - 1)) * plotW
      const y = padTop + plotH - ((val - minY) / (maxY - minY)) * plotH
      return { x, y, val, date: d.date, raw: d }
    })

    const linePath = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '')
    const areaPath = pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)},${(padTop + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)},${(padTop + plotH).toFixed(1)} Z`
      : ''

    const yTicks = [
      minY,
      Math.round(minY + (maxY - minY) * 0.33),
      Math.round(minY + (maxY - minY) * 0.66),
      maxY
    ]

    let thresholdY: number | null = null
    if (config.threshold !== undefined && config.threshold >= minY && config.threshold <= maxY) {
      thresholdY = padTop + plotH - ((config.threshold - minY) / (maxY - minY)) * plotH
    }

    return { points: pts, areaPath, linePath, minY, maxY, yTicks, thresholdY }
  }, [filteredData, config, plotW, plotH, padLeft, padTop])

  return (
    <div className="card p-6 md:p-8 space-y-6">
      {/* Header Grafik */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text tracking-tight flex items-center gap-2">
              <span>Tren Visual Longitudinal</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border transition-colors duration-300"
                style={{
                  backgroundColor: `${config.color}15`,
                  borderColor: `${config.color}35`,
                  color: config.color
                }}
              >
                Line Chart
              </span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Grafik deret waktu pemantauan kebiasaan ergonomi dan risiko mata pengguna.
            </p>
          </div>
        </div>

        {/* Filter Rentang Waktu */}
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-border self-start md:self-auto">
          {[
            { id: '7d', label: '7 Hari' },
            { id: '14d', label: '14 Hari' },
            { id: '30d', label: '30 Hari' },
            { id: 'all', label: 'Semua' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as TimeRange)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                timeRange === tab.id
                  ? 'bg-surface text-text shadow-sm border border-border'
                  : 'text-text-muted hover:text-text hover:bg-surface-3/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Pilihan Metrik (3 Tombol) */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Pilih Metrik untuk Ditinjau:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(METRICS) as MetricType[]).map((key) => {
            const item = METRICS[key]
            const Icon = item.icon
            const isSelected = activeMetric === key

            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={cn(
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
                  isSelected
                    ? item.activeButtonClass
                    : 'bg-surface-2 border-border hover:bg-surface-3/60 text-text-muted'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
                    isSelected ? item.activeIconClass : 'bg-surface text-text-muted border border-border'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-xs font-bold truncate', isSelected ? 'text-text font-black' : 'text-text-muted')}>
                    {item.shortLabel}
                  </p>
                  <span className="text-[11px] text-text-muted font-medium block">
                    Satuan: {item.unit}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bar Statistik Ringkas (Warna sinkron dengan menu aktif) */}
      <div className="space-y-2.5">
        {/* Penanda Konteks Metrik Aktif */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <span className="font-bold text-text">
              Statistik {config.shortLabel}
            </span>
            <span className="text-text-muted text-[11px]">
              ({timeRange === '7d' ? '7 Hari Terakhir' : timeRange === '14d' ? '14 Hari Terakhir' : timeRange === '30d' ? '30 Hari Terakhir' : 'Seluruh Hari Terpantau'})
            </span>
          </div>
          <span className={cn('text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border', config.badgeClass)}>
            Satuan: {config.unit}
          </span>
        </div>

        {/* 4 Kartu Statistik Berwarna Senada */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Rata-rata */}
          <div className={cn('p-4 rounded-2xl border transition-all duration-300 shadow-xs', config.statCardBgClass, config.statCardBorderClass)}>
            <span className={cn('text-[10px] uppercase font-bold tracking-wider block truncate', config.statLabelColorClass)}>
              Rata-rata Periode
            </span>
            <p className={cn('text-2xl font-black mt-1 font-figtree tracking-tight', config.statValueColorClass)}>
              {config.format(stats.avg)}
            </p>
          </div>

          {/* Card 2: Tertinggi */}
          <div className={cn('p-4 rounded-2xl border transition-all duration-300 shadow-xs', config.statCardBgClass, config.statCardBorderClass)}>
            <span className={cn('text-[10px] uppercase font-bold tracking-wider block truncate', config.statLabelColorClass)}>
              Tertinggi
            </span>
            <p className={cn('text-2xl font-black mt-1 font-figtree tracking-tight', config.statValueColorClass)}>
              {config.format(stats.max)}
            </p>
          </div>

          {/* Card 3: Terendah */}
          <div className={cn('p-4 rounded-2xl border transition-all duration-300 shadow-xs', config.statCardBgClass, config.statCardBorderClass)}>
            <span className={cn('text-[10px] uppercase font-bold tracking-wider block truncate', config.statLabelColorClass)}>
              Terendah
            </span>
            <p className={cn('text-2xl font-black mt-1 font-figtree tracking-tight', config.statValueColorClass)}>
              {config.format(stats.min)}
            </p>
          </div>

          {/* Card 4: Arah Tren */}
          <div className={cn('p-4 rounded-2xl border transition-all duration-300 shadow-xs', config.statCardBgClass, config.statCardBorderClass)}>
            <span className={cn('text-[10px] uppercase font-bold tracking-wider block truncate', config.statLabelColorClass)}>
              Arah Tren
            </span>
            <div className={cn('flex items-center gap-1.5 mt-1.5 text-sm font-black', config.statValueColorClass)}>
              {stats.trendDirection === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="truncate">Meningkat ({stats.diff > 0 ? `+${stats.diff}` : stats.diff})</span>
                </>
              )}
              {stats.trendDirection === 'down' && (
                <>
                  <TrendingDown className="w-4 h-4 shrink-0" />
                  <span className="truncate">Menurun ({stats.diff})</span>
                </>
              )}
              {stats.trendDirection === 'flat' && (
                <>
                  <Minus className="w-4 h-4 shrink-0" />
                  <span>Stabil Terjaga</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wadah Grafik Line Chart */}
      <div className="relative bg-surface-2/40 border border-border rounded-2xl p-4 sm:p-6 overflow-hidden">
        {/* Kanvas SVG Line Chart */}
        <div className="w-full aspect-[21/9] min-h-[220px] relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              {/* Gradient Area Fill */}
              <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
              </linearGradient>

              {/* Stroke Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={config.color} floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Garis Grid Horizontal & Label Sumbu Y */}
            {yTicks.map((tick, i) => {
              const y = padTop + plotH - ((tick - minY) / (maxY - minY)) * plotH
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-border/60"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-text-muted font-mono"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Garis Ambang Batas / Reference Threshold */}
            {thresholdY !== null && (
              <g>
                <line
                  x1={padLeft}
                  y1={thresholdY}
                  x2={width - padRight}
                  y2={thresholdY}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeWidth="1.5"
                  opacity="0.75"
                />
                <text
                  x={width - padRight}
                  y={thresholdY - 5}
                  textAnchor="end"
                  className="text-[9px] font-bold fill-error uppercase tracking-wider"
                >
                  {config.thresholdLabel}
                </text>
              </g>
            )}

            {/* Area Fill Gradient */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#grad-${activeMetric})`}
                className="transition-all duration-300"
              />
            )}

            {/* Line Stroke */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={config.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                className="transition-all duration-300"
              />
            )}

            {/* Titik-titik data statis tanpa efek hover */}
            {points.map((pt, idx) => {
              const showDot = points.length <= 30
              if (!showDot) return null

              return (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#ffffff"
                    stroke={config.color}
                    strokeWidth="2"
                  />
                </g>
              )
            })}

            {/* Label Sumbu X (Tanggal Terpilih) */}
            {points.map((pt, idx) => {
              const step = Math.max(1, Math.floor(points.length / 7))
              const isFirst = idx === 0
              const isLast = idx === points.length - 1
              const isStep = idx % step === 0

              if (!isFirst && !isLast && !isStep) return null

              return (
                <text
                  key={idx}
                  x={pt.x}
                  y={height - 12}
                  textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                  className="text-[10px] fill-text-muted font-medium"
                >
                  {formatDateLabel(pt.date)}
                </text>
              )
            })}
          </svg>
        </div>

        {/* Footer Keterangan Chart */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" style={{ color: config.color }} />
            <span>Garis grafik merefleksikan tren longitudinal kebiasaan visual harian pengguna.</span>
          </div>
          <span className="font-mono text-[10px]">
            {filteredData.length} hari ditampilkan
          </span>
        </div>
      </div>
    </div>
  )
}
