'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  fetchTestingSwitch,
  updateTestingSwitch,
  resetTestingSwitchLog,
  type TestingSwitchStatus
} from '@/lib/admin-api';
import {
  Bot,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  SkipForward,
  Loader2,
  SlidersHorizontal,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminTestingSwitchCard() {
  const { getToken } = useAuth();
  const [data, setData] = useState<TestingSwitchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [enabled, setEnabled] = useState(false);
  const [physicalId, setPhysicalId] = useState('dummyrobot01');
  const [selectedTarget, setSelectedTarget] = useState('ROBOT-01');

  const loadStatus = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetchTestingSwitch(token);
      if (res.success && res.data) {
        setData(res.data);
        setEnabled(res.data.enabled);
        setPhysicalId(res.data.physicalRobotId);
        setSelectedTarget(res.data.targetRobotId || 'ROBOT-01');
      }
    } catch (err: unknown) {
      console.error('Error fetching testing switch:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSave = async (targetOverride?: string, enabledOverride?: boolean) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      const nextTarget = targetOverride || selectedTarget;
      const nextEnabled = enabledOverride !== undefined ? enabledOverride : enabled;

      const res = await updateTestingSwitch(token, {
        enabled: nextEnabled,
        physicalRobotId: physicalId,
        targetRobotId: nextTarget
      });

      if (res.success) {
        setData(res.data);
        setSelectedTarget(res.data.targetRobotId);
        setEnabled(res.data.enabled);
        setMessage({
          type: 'success',
          text: `Saklar aktif dialihkan ke ${res.data.targetRobotId} (${res.data.enabled ? 'Aktif' : 'Nonaktif'})`
        });
      }
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memperbarui saklar pengujian'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNextUser = () => {
    if (!data || !data.availableTargets || data.availableTargets.length === 0) return;
    const currentIndex = data.availableTargets.findIndex(t => t.robotId === selectedTarget);
    const nextIndex = (currentIndex + 1) % data.availableTargets.length;
    const nextTarget = data.availableTargets[nextIndex].robotId;
    setSelectedTarget(nextTarget);
    handleSave(nextTarget, true);
  };

  const handleResetLog = async () => {
    const token = getToken();
    if (!token || !selectedTarget) return;
    const confirm = window.confirm(`Reset log harian untuk ${selectedTarget}? Data hari ini akan kembali ke 0 detik.`);
    if (!confirm) return;

    setResetting(true);
    setMessage(null);
    try {
      const res = await resetTestingSwitchLog(token, selectedTarget);
      if (res.success) {
        setMessage({ type: 'success', text: `Log hari ini untuk ${selectedTarget} berhasil di-reset!` });
        await loadStatus();
      }
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal mereset log target'
      });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-surface rounded-2xl border border-border flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-signal-blue" />
        <span className="text-sm font-medium text-text-muted">Memuat status saklar pengujian...</span>
      </div>
    );
  }

  const currentTargetObj = data?.availableTargets.find(t => t.robotId === selectedTarget);

  return (
    <div className="p-6 bg-surface rounded-2xl border border-border shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-signal-blue/10 text-signal-blue shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text">Saklar Pengujian Multi-User (1 Robot Fisik ke 10 User)</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-signal-blue/10 text-signal-blue border border-signal-blue/20">
                PKM Tool
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Alihkan aliran data kamera/sensor ESP32 secara instan ke wadah user penguji tanpa mengubah firmware.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto bg-surface-2/60 px-3 py-1.5 rounded-xl border border-border/60">
          <span className="text-xs font-semibold text-text">
            Status Saklar: <strong className={enabled ? 'text-emerald-500' : 'text-text-muted'}>{enabled ? 'AKTIF' : 'BYPASS'}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              handleSave(selectedTarget, next);
            }}
            disabled={saving}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              enabled ? 'bg-signal-blue' : 'bg-surface-3'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all',
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
          )}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Controller Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Physical Robot Input */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-text flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-text-muted" /> ID Robot Fisik (ESP32)
          </label>
          <input
            type="text"
            value={physicalId}
            onChange={(e) => setPhysicalId(e.target.value)}
            placeholder="dummyrobot01"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-surface-2 border border-border focus:border-signal-blue focus:outline-none transition-colors"
          />
          <span className="text-[10px] text-text-muted block">String ID yang dikirim oleh ESP32-CAM</span>
        </div>

        {/* Target User Dropdown */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-xs font-bold text-text flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Subjek / Target Penguji
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => {
              setSelectedTarget(e.target.value);
            }}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-surface-2 border border-border focus:border-signal-blue focus:outline-none transition-colors cursor-pointer"
          >
            {data?.availableTargets && data.availableTargets.length > 0 ? (
              data.availableTargets.map((t) => (
                <option key={t.robotId} value={t.robotId}>
                  {t.userName} ({t.robotId}) — {t.userEmail}
                </option>
              ))
            ) : (
              <option value="ROBOT-01">User 01 (ROBOT-01)</option>
            )}
          </select>
          <span className="text-[10px] text-text-muted block">Pilih akun responden yang sedang diuji</span>
        </div>

        {/* Save Button */}
        <div className="md:col-span-3 flex gap-2">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-signal-blue text-white shadow-sm hover:bg-signal-blue/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Simpan Saklar
          </button>
        </div>
      </div>

      {/* Target Preview & Quick Actions Bar */}
      <div className="p-4 rounded-xl bg-surface-2/70 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Target Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                enabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )}
            />
            <span className="text-xs font-semibold text-text">
              {enabled ? (
                <>
                  ESP32 ({physicalId}) diarahkan ke: <strong className="text-signal-blue">{currentTargetObj?.userName || selectedTarget}</strong> ({selectedTarget})
                </>
              ) : (
                <>
                  Mode Asli: Data ESP32 langsung menggunakan ID aslinya ({physicalId})
                </>
              )}
            </span>
          </div>

          {/* Today Stats Preview for Target */}
          {data?.todayStats && (
            <div className="flex items-center gap-4 text-[11px] text-text-muted pl-4">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Durasi Hari Ini: <strong className="text-text">{data.todayStats.totalDurationMin} menit</strong> ({data.todayStats.totalDurationSec}s)
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3 text-signal-blue" />
                Kedipan: <strong className="text-text">{data.todayStats.blinkCount} kali</strong>
              </span>
              <span>
                Status: <strong className="capitalize text-text">{data.todayStats.eyeHealthStatus}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleNextUser}
            disabled={saving}
            title="Pindah langsung ke user selanjutnya"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 text-signal-blue" />
            User Berikutnya
          </button>

          <button
            type="button"
            onClick={handleResetLog}
            disabled={resetting}
            title="Reset durasi dan kedipan user ini menjadi 0 untuk memulai sesi baru"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Reset Log User Ini
          </button>
        </div>
      </div>
    </div>
  );
}
