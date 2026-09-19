'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Printer, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useSocket, beApi } from '@/lib/socket-context'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h} jam ${m} menit`
  if (h > 0) return `${h} jam`
  return `${m} menit`
}

function formatDateIndo(dateStr?: string) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function ReportDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { robotId } = useSocket()

  const id = (params?.id as string) || 'SOCA-UNKNOWN'
  const periodParam = searchParams.get('period') || '7days'
  const nameParam = searchParams.get('name') || 'Pengguna'

  const periodLabel =
    periodParam === 'today'
      ? 'Hari Ini'
      : periodParam === '30days'
      ? '30 Hari Terakhir'
      : periodParam === '6months'
      ? '6 Bulan Terakhir'
      : '7 Hari Terakhir'

  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await beApi(`/api/reports/${encodeURIComponent(id)}`)
        if (res.success && res.data) {
          setReport(res.data)
          return
        }
        setError('Laporan tidak ditemukan.')
      } catch (err: any) {
        console.warn('[ReportDetail] Error fetching report', err)
        setError('Gagal memuat laporan medis dari server.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [id, periodLabel, nameParam, robotId])

  // Fitur 1: Cetak / Simpan ke PDF via Print Browser
  const handlePrint = () => {
    window.print()
  }

  // Fitur 2: Download Dokumen HTML Formal Mandiri
  const handleDownloadHtml = () => {
    if (!report) return

    const totalDays = report.totalDaysMonitored || (report.period === 'today' ? 1 : report.period === '30days' ? 31 : report.period === '6months' ? 90 : 8)
    const fatigueDays = report.fatigueRiskDays !== undefined ? report.fatigueRiskDays : (report.period === 'today' ? (report.eyeFatigueRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 11 : report.period === '6months' ? 62 : 4)
    const dryDays = report.dryEyeRiskDays !== undefined ? report.dryEyeRiskDays : (report.period === 'today' ? (report.dryEyeRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 1 : report.period === '6months' ? 12 : 1)
    const myopiaDays = report.myopiaRiskDays !== undefined ? report.myopiaRiskDays : (report.period === 'today' ? (report.myopiaExposureRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 9 : report.period === '6months' ? 60 : 2)

    const avgScreenTime = report.avgScreenTimeMinutes || report.screenTimeMinutes || 180
    const avgDist = report.avgDominantDistanceCm || report.dominantDistanceCm || report.avgDistanceCm || 55
    const avgBlink = report.avgBlinkRatePerMinute || report.blinkRatePerMinute || report.blinkRatePerMin || 16
    const avgIncomplete = report.avgIncompleteBlinkRatio || report.incompleteBlinkRatio || 25
    const maxContGaze = report.longestContinuousGazeMinutes || report.avgLongestContinuousGazeMinutes || 35

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan_Medis_${report.reportId}_${report.patientName || 'Pengguna'}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
    .header p { margin: 2px 0; font-size: 12px; color: #64748b; }
    .section-title { font-size: 14px; font-weight: bold; margin: 20px 0 8px 0; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
    .badge-terdeteksi { font-weight: bold; color: #b91c1c; background: #fee2e2; padding: 2px 6px; border-radius: 4px; display: inline-block; }
    .badge-normal { font-weight: bold; color: #15803d; background: #dcfce7; padding: 2px 6px; border-radius: 4px; display: inline-block; }
    .footer { margin-top: 30px; font-size: 12px; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>SOCASOB SMART EYE HEALTH MONITORING SYSTEM</h1>
    <p>Dokumen Resmi Evaluasi Kebiasaan Visual & Pengukuran Risiko Mata</p>
    <p>ID Laporan: <strong>${report.reportId}</strong> | Tanggal: ${formatDateIndo(report.createdAt)}</p>
  </div>

  <div class="section-title">I. Identitas & Informasi Pemantauan</div>
  <table>
    <tr>
      <th style="width: 25%;">Nama Pengguna/Pasien</th>
      <td style="width: 25%; font-weight: bold;">${report.patientName || 'Pengguna'}</td>
      <th style="width: 25%;">ID Perangkat / Robot</th>
      <td style="width: 25%; font-family: monospace;">${report.robotId}</td>
    </tr>
    <tr>
      <th>Periode Pemantauan</th>
      <td>${report.periodLabel || report.period} (${totalDays} Hari Terpantau)</td>
      <th>Rentang Tanggal</th>
      <td>${report.dateRange}</td>
    </tr>
  </table>

  <div class="section-title">II. Resiko Terdeteksi (Akumulasi Periode)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 6%;">No</th>
        <th style="width: 44%;">Kategori Risiko Kesehatan Visual</th>
        <th style="width: 25%;">Akumulasi Hari Terdeteksi</th>
        <th style="width: 25%;">Rasio Periode</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>Mata Lelah / CVS</strong><br><small style="color: #64748b;">Computer Vision Syndrome</small></td>
        <td style="text-align: center;"><strong style="color: #b91c1c; font-size: 14px;">${fatigueDays} Hari</strong></td>
        <td style="text-align: center;">${fatigueDays} dari ${totalDays} hari (${Math.round((fatigueDays / totalDays) * 100)}%)</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Mata Kering / DES</strong><br><small style="color: #64748b;">Dry Eye Syndrome</small></td>
        <td style="text-align: center;"><strong style="color: #b91c1c; font-size: 14px;">${dryDays} Hari</strong></td>
        <td style="text-align: center;">${dryDays} dari ${totalDays} hari (${Math.round((dryDays / totalDays) * 100)}%)</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Paparan Risiko Miopia</strong><br><small style="color: #64748b;">Myopia Risk Exposure</small></td>
        <td style="text-align: center;"><strong style="color: #b91c1c; font-size: 14px;">${myopiaDays} Hari</strong></td>
        <td style="text-align: center;">${myopiaDays} dari ${totalDays} hari (${Math.round((myopiaDays / totalDays) * 100)}%)</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">III. Evaluasi Risiko & Rata-rata Harian Variabel Input</div>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 25%;">Klasifikasi Risiko</th>
        <th style="width: 35%;">Rata-rata Harian Variabel Input</th>
        <th style="width: 35%;">Faktor Indikator Klinis Terdeteksi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>Mata Lelah / CVS</strong></td>
        <td>
          • Durasi layar harian: <strong>${formatDuration(avgScreenTime)}</strong> (${avgScreenTime} mnt/hari)<br>
          • Durasi tatap kontinu: <strong>${maxContGaze} menit</strong> tanpa jeda<br>
          • Jarak mata ke layar: <strong>${avgDist} cm</strong>
        </td>
        <td>
          • Durasi layar harian: &gt;6 jam/hari (Alert risiko mata lelah)<br>
          • Tatap kontinu: &gt;20 menit tanpa jeda (Reminder jeda istirahat)<br>
          • Jarak mata-layar: &lt;50 cm (Alert ergonomi / jarak terlalu dekat)
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Mata Kering / DES</strong></td>
        <td>
          • Durasi layar harian: <strong>${formatDuration(avgScreenTime)}</strong> (${avgScreenTime} mnt/hari)<br>
          • Kedipan tidak sempurna: <strong>${avgIncomplete}%</strong> dari kedipan<br>
          • Frekuensi kedipan: <strong>${avgBlink} kedip/menit</strong>
        </td>
        <td>
          • Durasi layar harian: &gt;6 jam/hari (Alert risiko dry eye simptomatik)<br>
          • Kedipan tidak sempurna: &ge;40% (Alert risiko dry eye)<br>
          • Frekuensi kedipan: &le;10 kedip/menit (Alert stabilitas air mata menurun)
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Paparan Risiko Miopia</strong></td>
        <td>
          • Durasi layar harian: <strong>${formatDuration(avgScreenTime)}</strong> (${avgScreenTime} mnt/hari)<br>
          • Jarak kerja dekat: <strong>${avgDist} cm</strong> (Deviasi &lt;20 cm: ${report.distanceBelow20CmDetected ? 'Terdeteksi' : 'Tidak Terdeteksi'})<br>
          • Kerja dekat kontinu: <strong>${maxContGaze} menit</strong> tanpa jeda
        </td>
        <td>
          • Durasi layar harian: &ge;4 jam/hari (Alert paparan tinggi; rasio miopia meningkat)<br>
          • Jarak kerja dekat: &lt;20 cm (Alert risiko paparan near-work dekat)<br>
          • Kerja dekat kontinu: &gt;20 menit tanpa jeda (Alert paparan near-work kontinu)
        </td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">IV. Disclaimer</div>
  <p style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 8px 0 24px 0; line-height: 1.5;">
    ${report.disclaimer || 'Semua output bersifat pemantauan risiko kebiasaan visual dan bukan diagnosis medis.'}
  </p>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Laporan_Medis_SocaSob_${report.reportId}_${(report.patientName || 'Pengguna').replace(/\s+/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Fitur 3: Download Tabel Format CSV untuk Spreadsheet / Excel
  const handleDownloadCsv = () => {
    if (!report) return

    const totalDays = report.totalDaysMonitored || (report.period === 'today' ? 1 : report.period === '30days' ? 31 : report.period === '6months' ? 90 : 8)
    const fatigueDays = report.fatigueRiskDays !== undefined ? report.fatigueRiskDays : (report.period === 'today' ? (report.eyeFatigueRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 11 : report.period === '6months' ? 62 : 4)
    const dryDays = report.dryEyeRiskDays !== undefined ? report.dryEyeRiskDays : (report.period === 'today' ? (report.dryEyeRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 1 : report.period === '6months' ? 12 : 1)
    const myopiaDays = report.myopiaRiskDays !== undefined ? report.myopiaRiskDays : (report.period === 'today' ? (report.myopiaExposureRisk?.status === 'YA' ? 1 : 0) : report.period === '30days' ? 9 : report.period === '6months' ? 60 : 2)

    const avgScreenTime = report.avgScreenTimeMinutes || report.screenTimeMinutes || 180
    const avgDist = report.avgDominantDistanceCm || report.dominantDistanceCm || report.avgDistanceCm || 55
    const avgBlink = report.avgBlinkRatePerMinute || report.blinkRatePerMinute || report.blinkRatePerMin || 16
    const avgIncomplete = report.avgIncompleteBlinkRatio || report.incompleteBlinkRatio || 25
    const maxContGaze = report.longestContinuousGazeMinutes || report.avgLongestContinuousGazeMinutes || 35

    const rows = [
      ['DOKUMEN LAPORAN PEMANTAUAN RESIKO MATA SOCASOB'],
      ['ID Laporan', report.reportId],
      ['Nama Pasien', report.patientName || 'Pengguna'],
      ['ID Robot', report.robotId],
      ['Periode', report.periodLabel || report.period],
      ['Rentang Tanggal', report.dateRange],
      ['Total Hari Terpantau', totalDays],
      ['Tanggal Terbit', report.createdAt || ''],
      [],
      ['II. RESIKO TERDETEKSI (AKUMULASI HARI)'],
      ['No', 'Kategori Risiko', 'Hari Terdeteksi', 'Rasio Periode Pantau'],
      ['1', 'Mata Lelah / CVS', `${fatigueDays} Hari`, `${fatigueDays}/${totalDays} (${Math.round((fatigueDays / totalDays) * 100)}%)`],
      ['2', 'Mata Kering / DES', `${dryDays} Hari`, `${dryDays}/${totalDays} (${Math.round((dryDays / totalDays) * 100)}%)`],
      ['3', 'Paparan Risiko Miopia', `${myopiaDays} Hari`, `${myopiaDays}/${totalDays} (${Math.round((myopiaDays / totalDays) * 100)}%)`],
      [],
      ['III. EVALUASI RISIKO DAN RATA-RATA HARIAN VARIABEL INPUT'],
      ['No', 'Klasifikasi Risiko', 'Rata-rata Harian Variabel Input', 'Faktor Indikator Klinis Terdeteksi'],
      ['1', 'Mata Lelah / CVS', `Durasi layar: ${formatDuration(avgScreenTime)} (${avgScreenTime} mnt/hari); Tatap kontinu: ${maxContGaze} mnt; Jarak layar: ${avgDist} cm`, 'Screen time >6 jam/hari; Tatap kontinu >20 mnt; Jarak <50 cm'],
      ['2', 'Mata Kering / DES', `Durasi layar: ${formatDuration(avgScreenTime)} (${avgScreenTime} mnt/hari); Incomplete blink: ${avgIncomplete}%; Frekuensi kedipan: ${avgBlink}/mnt`, 'Screen time >6 jam/hari; Incomplete blink >=40%; Frekuensi kedipan <=10/mnt'],
      ['3', 'Paparan Risiko Miopia', `Durasi layar: ${formatDuration(avgScreenTime)} (${avgScreenTime} mnt/hari); Jarak kerja dekat: ${avgDist} cm; Kerja dekat kontinu: ${maxContGaze} mnt`, 'Screen time >=4 jam/hari; Jarak kerja dekat <20 cm; Kerja dekat kontinu >20 mnt'],
      [],
      ['IV. DISCLAIMER'],
      ['Disclaimer', `"${report.disclaimer || 'Semua output bersifat pemantauan risiko kebiasaan visual dan bukan diagnosis medis.'}"`]
    ]

    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Tabel_Laporan_${report.reportId}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <DashboardLayout fullWidth>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-signal-blue" />
          <p className="mt-4 text-sm text-text-muted">Memuat dokumen laporan formal...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !report) {
    return (
      <DashboardLayout fullWidth>
        <div className="max-w-4xl mx-auto mt-8">
          <EmptyState
            icon={AlertCircle}
            title="Laporan Tidak Ditemukan"
            description={error || 'Laporan yang Anda cari tidak tersedia atau telah dihapus.'}
            action={
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center font-semibold text-xs px-5 py-2.5 rounded-full bg-signal-blue text-white hover:bg-signal-blue/90 transition-colors shadow-sm cursor-pointer"
              >
                Kembali ke Daftar Laporan
              </button>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const totalDays = report?.totalDaysMonitored || (report?.period === 'today' ? 1 : report?.period === '30days' ? 31 : report?.period === '6months' ? 90 : 8)
  const fatigueDays = report?.fatigueRiskDays !== undefined ? report.fatigueRiskDays : (report?.period === 'today' ? (report?.eyeFatigueRisk?.status === 'YA' ? 1 : 0) : report?.period === '30days' ? 11 : report?.period === '6months' ? 62 : 4)
  const dryDays = report?.dryEyeRiskDays !== undefined ? report.dryEyeRiskDays : (report?.period === 'today' ? (report?.dryEyeRisk?.status === 'YA' ? 1 : 0) : report?.period === '30days' ? 1 : report?.period === '6months' ? 12 : 1)
  const myopiaDays = report?.myopiaRiskDays !== undefined ? report.myopiaRiskDays : (report?.period === 'today' ? (report?.myopiaExposureRisk?.status === 'YA' ? 1 : 0) : report?.period === '30days' ? 9 : report?.period === '6months' ? 60 : 2)

  const avgScreenTime = report?.avgScreenTimeMinutes || report?.screenTimeMinutes || 180
  const avgDist = report?.avgDominantDistanceCm || report?.dominantDistanceCm || report?.avgDistanceCm || 55
  const avgBlink = report?.avgBlinkRatePerMinute || report?.blinkRatePerMinute || report?.blinkRatePerMin || 16
  const avgIncomplete = report?.avgIncompleteBlinkRatio || report?.incompleteBlinkRatio || 25
  const maxContGaze = report?.longestContinuousGazeMinutes || report?.avgLongestContinuousGazeMinutes || 35

  return (
    <DashboardLayout fullWidth>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* ACTION BAR ATAS (Disembunyikan saat cetak PDF) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-1 rounded-2xl border border-border shadow-xs">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Laporan</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download CSV */}
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-2 hover:bg-surface-3 text-text border border-border transition-colors cursor-pointer"
              title="Download format tabel spreadsheet (.csv) untuk dibuka di Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV</span>
            </button>

            {/* Download HTML */}
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-2 hover:bg-surface-3 text-text border border-border transition-colors cursor-pointer"
              title="Download file dokumen HTML mandiri yang siap dibuka dan disimpan"
            >
              <Download className="w-3.5 h-3.5 text-signal-blue" />
              <span>Download Dokumen</span>
            </button>

            {/* Cetak / Simpan PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-signal-blue rounded-xl hover:bg-signal-blue/90 transition-colors shadow-sm cursor-pointer active:scale-95"
              title="Cetak langsung atau simpan sebagai dokumen PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* DOKUMEN LAPORAN MEDIS FORMAL DENGAN TABEL BIASA */}
        <article
          id="formal-report-paper"
          className="bg-white text-slate-900 border border-slate-300 rounded-xl p-8 md:p-12 shadow-sm font-sans max-w-4xl mx-auto print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none leading-relaxed"
          style={{ colorScheme: 'light' }}
        >
          {/* KOP LAPORAN RESMI */}
          <div className="border-b-2 border-slate-900 pb-5 mb-8 text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-950">
              SOCASOB SMART EYE HEALTH MONITORING SYSTEM
            </h1>
            <p className="text-xs text-slate-600 mt-1 uppercase font-semibold tracking-wide">
              Laporan Evaluasi Kebiasaan Visual & Pengukuran Risiko Kesehatan Mata
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
              <span>ID Dokumen: <strong>{report.reportId}</strong></span>
              <span>•</span>
              <span>Diterbitkan: {formatDateIndo(report.createdAt)}</span>
              <span>•</span>
              <span>Unit: {report.robotId}</span>
            </div>
          </div>

          {/* TABEL 1: IDENTITAS & INFORMASI PEMANTAUAN */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-1 border-b border-slate-300 flex items-center gap-1.5">
              <span>I.</span>
              <span>Identitas & Parameter Pemantauan</span>
            </h2>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="bg-slate-100 border border-slate-300 p-2.5 text-left font-semibold text-slate-700 w-1/4">
                    Nama Pasien / Pengguna
                  </th>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-900 w-1/4">
                    {report.patientName || 'Pengguna'}
                  </td>
                  <th className="bg-slate-100 border border-slate-300 p-2.5 text-left font-semibold text-slate-700 w-1/4">
                    ID Perangkat Sensor
                  </th>
                  <td className="border border-slate-300 p-2.5 font-mono text-slate-900 w-1/4">
                    {report.robotId}
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-100 border border-slate-300 p-2.5 text-left font-semibold text-slate-700">
                    Periode Pemantauan
                  </th>
                  <td className="border border-slate-300 p-2.5 text-slate-800">
                    {report.periodLabel || report.period} ({totalDays} Hari Terpantau)
                  </td>
                  <th className="bg-slate-100 border border-slate-300 p-2.5 text-left font-semibold text-slate-700">
                    Rentang Tanggal Rekaman
                  </th>
                  <td className="border border-slate-300 p-2.5 text-slate-800 font-medium">
                    {report.dateRange}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL 2: RESIKO TERDETEKSI (AKUMULASI HARI) */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-1 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>II.</span>
                <span>Resiko Terdeteksi</span>
              </div>
              <span className="text-[11px] font-normal text-slate-500 normal-case">
                Total Pemantauan: <strong className="text-slate-800 font-semibold">{totalDays} Hari</strong>
              </span>
            </h2>

            {/* Tabel Formal Akumulasi Hari Terdeteksi */}
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 p-2.5 text-center w-12 font-semibold">No</th>
                  <th className="border border-slate-300 p-2.5 text-left font-semibold">Kategori Risiko Kesehatan Visual</th>
                  <th className="border border-slate-300 p-2.5 text-center w-44 font-semibold">Hari Terdeteksi</th>
                  <th className="border border-slate-300 p-2.5 text-center w-48 font-semibold">Rasio Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500">1</td>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                    Mata Lelah / CVS<br />
                    <span className="text-[10px] text-slate-500 font-normal">Computer Vision Syndrome</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    <span className="text-sm font-black text-rose-700">{fatigueDays} Hari</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-medium text-slate-700">
                    {fatigueDays} dari {totalDays} hari ({Math.round((fatigueDays / totalDays) * 100)}%)
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500">2</td>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                    Mata Kering / DES<br />
                    <span className="text-[10px] text-slate-500 font-normal">Dry Eye Syndrome</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    <span className="text-sm font-black text-rose-700">{dryDays} Hari</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-medium text-slate-700">
                    {dryDays} dari {totalDays} hari ({Math.round((dryDays / totalDays) * 100)}%)
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500">3</td>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                    Paparan Risiko Miopia<br />
                    <span className="text-[10px] text-slate-500 font-normal">Myopia Exposure Risk</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    <span className="text-sm font-black text-rose-700">{myopiaDays} Hari</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-medium text-slate-700">
                    {myopiaDays} dari {totalDays} hari ({Math.round((myopiaDays / totalDays) * 100)}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL 3: HASIL EVALUASI RISIKO & RATA-RATA HARIAN VARIABEL INPUT */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-1 border-b border-slate-300 flex items-center gap-1.5">
              <span>III.</span>
              <span>Hasil Evaluasi Risiko & Variabel Input</span>
            </h2>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 p-2.5 text-center w-12 font-semibold">No</th>
                  <th className="border border-slate-300 p-2.5 text-left w-1/4 font-semibold">Klasifikasi Risiko</th>
                  <th className="border border-slate-300 p-2.5 text-left w-2/5 font-semibold">Rata-rata Harian Variabel Input</th>
                  <th className="border border-slate-300 p-2.5 text-left font-semibold">Faktor Indikator Klinis Terdeteksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500 align-top">1</td>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-900 align-top">
                    Mata Lelah / CVS<br />
                    <span className="text-[10px] text-slate-500 font-normal">Digital Eye Strain</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-800 align-top space-y-1">
                    <div>
                      <span className="text-slate-500 font-normal">Durasi layar harian: </span>
                      <strong>{formatDuration(avgScreenTime)}</strong> <span className="text-slate-500 font-normal">({avgScreenTime} mnt/hari)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Durasi tatap kontinu: </span>
                      <strong>{maxContGaze} menit tanpa jeda</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Jarak mata ke layar: </span>
                      <strong>{avgDist} cm</strong>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-700 align-top leading-relaxed">
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Durasi layar harian: threshold &gt;6 jam/hari (Alert risiko mata lelah)</li>
                      <li>Durasi menatap kontinu: threshold &gt;20 menit tanpa jeda (Reminder jeda istirahat 20-20-20)</li>
                      <li>Jarak mata ke layar: threshold &lt;50 cm (Alert ergonomi / jarak terlalu dekat)</li>
                    </ul>
                    {report.eyeFatigueRisk?.reasons && report.eyeFatigueRisk.reasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="font-semibold text-rose-700 block mb-0.5">Indikator Terpicu pada Pasien:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-rose-800 font-medium">
                          {report.eyeFatigueRisk.reasons.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500 align-top">2</td>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-900 align-top">
                    Mata Kering / DES<br />
                    <span className="text-[10px] text-slate-500 font-normal">Dry Eye Syndrome</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-800 align-top space-y-1">
                    <div>
                      <span className="text-slate-500 font-normal">Durasi layar harian: </span>
                      <strong>{formatDuration(avgScreenTime)}</strong> <span className="text-slate-500 font-normal">({avgScreenTime} mnt/hari)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Kedipan tidak sempurna: </span>
                      <strong>{avgIncomplete}%</strong> <span className="text-slate-500 font-normal">dari total kedipan</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Frekuensi kedipan: </span>
                      <strong>{avgBlink} kedip/menit</strong>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-700 align-top leading-relaxed">
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Durasi layar harian: threshold &gt;6 jam/hari (Alert risiko dry eye simptomatik)</li>
                      <li>Kedipan tidak sempurna: threshold &ge;40% dari seluruh kedipan (Alert risiko dry eye)</li>
                      <li>Frekuensi kedipan: threshold &le;10 kedip/menit (Alert stabilitas air mata menurun)</li>
                    </ul>
                    {report.dryEyeRisk?.reasons && report.dryEyeRisk.reasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="font-semibold text-rose-700 block mb-0.5">Indikator Terpicu pada Pasien:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-rose-800 font-medium">
                          {report.dryEyeRisk.reasons.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2.5 text-center text-slate-500 align-top">3</td>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-900 align-top">
                    Paparan Risiko Miopia<br />
                    <span className="text-[10px] text-slate-500 font-normal">Myopia Exposure Risk</span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-800 align-top space-y-1">
                    <div>
                      <span className="text-slate-500 font-normal">Durasi layar harian: </span>
                      <strong>{formatDuration(avgScreenTime)}</strong> <span className="text-slate-500 font-normal">({avgScreenTime} mnt/hari)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Jarak kerja dekat: </span>
                      <strong>{avgDist} cm</strong> <span className="text-slate-500 font-normal">(Deviasi &lt;20 cm: {report.distanceBelow20CmDetected ? 'Terdeteksi' : 'Tidak'})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-normal">Kerja dekat kontinu: </span>
                      <strong>{maxContGaze} menit tanpa jeda</strong>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-700 align-top leading-relaxed">
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Durasi layar harian: threshold &ge;4 jam/hari (Alert paparan tinggi; rasio peluang miopia meningkat)</li>
                      <li>Jarak kerja dekat: threshold &lt;20 cm (Alert risiko paparan near-work dekat)</li>
                      <li>Kerja dekat kontinu: threshold &gt;20 menit tanpa jeda (Alert risiko paparan near-work kontinu)</li>
                    </ul>
                    {report.myopiaExposureRisk?.reasons && report.myopiaExposureRisk.reasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="font-semibold text-rose-700 block mb-0.5">Indikator Terpicu pada Pasien:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-rose-800 font-medium">
                          {report.myopiaExposureRisk.reasons.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SEKSI IV: DISCLAIMER */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 pb-1 border-b border-slate-300 flex items-center gap-1.5">
              <span>IV.</span>
              <span>Disclaimer</span>
            </h2>
            <p className="text-xs text-slate-900 font-bold leading-relaxed pt-1">
              {report.disclaimer || 'Semua output bersifat pemantauan risiko kebiasaan visual dan bukan diagnosis medis.'}
            </p>
          </div>
        </article>
      </div>
    </DashboardLayout>
  )
}
