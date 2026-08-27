'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchMlConfig, updateMlConfig } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  RefreshCw,
  Cpu,
  Wifi,
  WifiOff,
  Eye,
  Video,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MlConfig {
  be_url: string;
  flask_host: string;
  flask_port: number;
  flask_debug: boolean;
  video_source: 'webcam' | 'esp32';
  esp32_stream_url: string;
  webcam_index: number;
  ear_threshold: number;
  consec_frames: number;
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  be_connected: boolean;
  pipeline_running: boolean;
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-signal-blue/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-signal-blue" />
      </div>
      <h3 className="text-sm font-bold text-text">{title}</h3>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full',
        ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
      )}
    >
      {ok ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {label}: {ok ? 'Terhubung' : 'Terputus'}
    </span>
  );
}

export function AdminMlTab() {
  const { getToken } = useAuth();
  const [config, setConfig] = useState<MlConfig | null>(null);
  const [form, setForm] = useState<Partial<MlConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchMlConfig(token);
      setConfig(res.data);
      setForm({
        ear_threshold: res.data.ear_threshold,
        consec_frames: res.data.consec_frames,
        video_source: res.data.video_source,
        webcam_index: res.data.webcam_index,
        esp32_stream_url: res.data.esp32_stream_url,
        log_level: res.data.log_level,
      });
    } catch (e: any) {
      setError(
        e.message.includes('503') || e.message.includes('ML')
          ? 'ML Server tidak tersedia. Pastikan server ML berjalan dan ML_URL sudah dikonfigurasi di backend.'
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateMlConfig(token, form);
      setSuccessMsg('Konfigurasi ML berhasil disimpan.');
      await load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (!config) return;
    setForm({
      ear_threshold: config.ear_threshold,
      consec_frames: config.consec_frames,
      video_source: config.video_source,
      webcam_index: config.webcam_index,
      esp32_stream_url: config.esp32_stream_url,
      log_level: config.log_level,
    });
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text">Konfigurasi ML Server</h2>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-20 text-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Menghubungi ML Server...</span>
        </div>
      ) : !config ? (
        <div className="card flex flex-col items-center justify-center py-16 text-text-muted gap-3">
          <Cpu className="w-10 h-10 opacity-40" />
          <p className="text-sm text-center">
            ML Server tidak bisa dijangkau.
            <br />
            Cek konfigurasi <code className="font-mono text-xs bg-surface-2 px-1 py-0.5 rounded">ML_URL</code> di backend.
          </p>
          <Button variant="secondary" onClick={load} size="sm">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="card p-5 space-y-4">
            <SectionTitle icon={Cpu} title="Status ML Server" />
            <div className="flex flex-wrap gap-2">
              <StatusBadge ok={config.be_connected} label="Backend Socket" />
              <StatusBadge ok={config.pipeline_running} label="CV Pipeline" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {[
                { label: 'Host', value: config.flask_host },
                { label: 'Port', value: config.flask_port },
                { label: 'Debug Mode', value: config.flask_debug ? 'ON' : 'OFF' },
                { label: 'Backend URL', value: config.be_url },
              ].map((item) => (
                <div key={item.label} className="bg-surface-2/50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-mono font-bold text-text truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Eye Detection Config */}
          <div className="card p-5 space-y-4">
            <SectionTitle icon={Eye} title="Deteksi Mata (Computer Vision)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  EAR Threshold
                  <span className="ml-1 text-text-muted font-normal">
                    (rentang: 0.10 – 0.50, default: 0.23)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  max="0.50"
                  value={form.ear_threshold ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ear_threshold: parseFloat(e.target.value) }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-signal-blue/30"
                />
                <p className="text-xs text-text-muted mt-1">
                  EAR (Eye Aspect Ratio) — nilai lebih rendah = lebih sensitif mendeteksi kedipan.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Consec Frames untuk Blink
                  <span className="ml-1 text-text-muted font-normal">(1–10, default: 1)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="10"
                  value={form.consec_frames ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, consec_frames: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-signal-blue/30"
                />
                <p className="text-xs text-text-muted mt-1">
                  Jumlah frame berturut-turut EAR di bawah threshold agar dihitung sebagai kedipan.
                </p>
              </div>
            </div>
          </div>

          {/* System Config */}
          <div className="card p-5 space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Log Level
              </label>
              <select
                value={form.log_level ?? 'INFO'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    log_level: e.target.value as MlConfig['log_level'],
                  }))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-signal-blue/30"
              >
                {['DEBUG', 'INFO', 'WARNING', 'ERROR'].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Button variant="secondary" onClick={resetForm} size="sm">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSave} loading={saving} size="sm">
              <Save className="w-4 h-4" />
              Simpan Konfigurasi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
