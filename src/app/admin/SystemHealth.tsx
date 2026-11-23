import { useState, useEffect } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, AlertCircle,
  RefreshCw, Database, Bot, Mail, Wrench,
  BarChart3, Activity, Server,
} from "lucide-react";
import { authFetch } from '../shared/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceStatus = "operational" | "degraded" | "error" | "unavailable";

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency_ms: number | null;
  detail: string;
}

interface SystemHealthData {
  services: ServiceHealth[];
  total_analyses: number;
  checked_at: string;
  overall_status: "operational" | "degraded" | "error" | "unavailable";
}

// ─── Status configuration ─────────────────────────────────────────────────────

const STATUS_CFG: Record<ServiceStatus, {
  dot: string; badge: string; badgeText: string; label: string;
}> = {
  operational: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    badgeText: "Operational",
    label: "Operational",
  },
  degraded: {
    dot: "bg-amber-500 animate-pulse",
    badge: "bg-amber-100 text-amber-700",
    badgeText: "Degraded",
    label: "Degraded",
  },
  error: {
    dot: "bg-red-500 animate-pulse",
    badge: "bg-red-100 text-red-700",
    badgeText: "Error",
    label: "Error",
  },
  unavailable: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500",
    badgeText: "Unavailable",
    label: "Unavailable",
  },
};

// ─── Service icon map ─────────────────────────────────────────────────────────

function ServiceIcon({ name }: { name: string }) {
  const cls = "w-4 h-4 flex-shrink-0";
  if (name.includes("PostgreSQL")) return <Database className={cls} />;
  if (name.includes("Gemini"))     return <Bot      className={cls} />;
  if (name.includes("Email"))      return <Mail     className={cls} />;
  if (name.includes("Analysis"))   return <Wrench   className={cls} />;
  return <Server className={cls} />;
}

// ─── Overall banner ───────────────────────────────────────────────────────────

function OverallBanner({
  overall, services,
}: {
  overall: SystemHealthData["overall_status"];
  services: ServiceHealth[];
}) {
  const degraded  = services.filter(s => s.status === "degraded").length;
  const errors    = services.filter(s => s.status === "error").length;
  const unavail   = services.filter(s => s.status === "unavailable").length;

  if (overall === "operational") {
    return (
      <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div className="font-bold text-green-800">All core systems operational</div>
          <div className="text-sm text-green-600">
            {services.length} services checked and verified live.
          </div>
        </div>
      </div>
    );
  }

  if (overall === "error") {
    const parts: string[] = [];
    if (errors)   parts.push(`${errors} service${errors > 1 ? "s" : ""} with errors`);
    if (degraded) parts.push(`${degraded} degraded`);
    if (unavail)  parts.push(`${unavail} unavailable`);
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <div className="font-bold text-red-800">Service disruption detected</div>
          <div className="text-sm text-red-600">{parts.join(" · ")}</div>
        </div>
      </div>
    );
  }

  // degraded or unavailable
  const parts: string[] = [];
  if (degraded) parts.push(`${degraded} degraded`);
  if (unavail)  parts.push(`${unavail} unavailable`);
  if (errors)   parts.push(`${errors} with errors`);
  return (
    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <div className="font-bold text-amber-800">Some services need attention</div>
        <div className="text-sm text-amber-600">{parts.join(" · ")}</div>
      </div>
    </div>
  );
}

// ─── ADMIN: SYSTEM HEALTH ─────────────────────────────────────────────────────

export function SystemHealth() {
  const [data, setData]       = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/system-health');
      if (!res.ok) {
        let msg = `Health check failed (HTTP ${res.status})`;
        try {
          const body = await res.json();
          if (body?.detail) msg = body.detail;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      const json: SystemHealthData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load system health data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // ── Derived display values ────────────────────────────────────────────────
  const operationalCount = data ? data.services.filter(s => s.status === "operational").length : 0;
  const dbService        = data?.services.find(s => s.name.includes("PostgreSQL"));
  const dbLatency        = dbService?.latency_ms != null
    ? `${dbService.latency_ms} ms` : "—";
  const checkedAt = data?.checked_at
    ? new Date(data.checked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div className="p-8 space-y-8 min-h-full">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">System Health</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Live health checks for all integrated services
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          {loading ? "Checking…" : "Re-check"}
        </button>
      </div>

      {/* ── Status banner ────────────────────────────────────────────────── */}
      {loading && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
          <div>
            <div className="font-bold text-slate-700">Checking system status…</div>
            <div className="text-sm text-slate-500">
              Running live health checks — this may take a few seconds.
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-800">Health check failed</div>
            <div className="text-sm text-red-600">{error}</div>
          </div>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <OverallBanner overall={data.overall_status} services={data.services} />
      )}

      {/* ── Service status table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <h3 className="font-bold text-[#0F172A]">Service Status</h3>
          {data?.checked_at && (
            <span className="text-xs text-[#94A3B8]">Last checked: {checkedAt}</span>
          )}
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {/* Loading skeleton */}
          {loading && [1, 2, 3, 4].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center gap-8">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}

          {/* Error state */}
          {!loading && error && (
            <div className="px-6 py-8 text-center text-sm text-[#64748B]">
              Health check results unavailable. Click Re-check to try again.
            </div>
          )}

          {/* Real service rows */}
          {!loading && !error && data && data.services.map(svc => {
            const cfg = STATUS_CFG[svc.status] ?? STATUS_CFG.unavailable;
            return (
              <div key={svc.name} className="px-6 py-4 flex items-center justify-between gap-4">
                {/* Left: status dot + icon + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 text-[#64748B]">
                    <ServiceIcon name={svc.name} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] truncate">{svc.name}</div>
                    <div className="text-xs text-[#94A3B8] truncate max-w-xs">{svc.detail}</div>
                  </div>
                </div>

                {/* Right: latency + badge */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-[#94A3B8]">Latency</div>
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {svc.latency_ms != null ? `${svc.latency_ms} ms` : "—"}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold w-28 text-center ${cfg.badge}`}>
                    {cfg.badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Real metric cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Analyses — real database count */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] mb-0.5">
            {loading ? (
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
            ) : (
              data?.total_analyses?.toLocaleString() ?? "—"
            )}
          </div>
          <div className="text-xs text-[#64748B]">Total Analyses (all users)</div>
        </div>

        {/* DB Response — real measured latency */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] mb-0.5">
            {loading ? (
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
            ) : (
              dbLatency
            )}
          </div>
          <div className="text-xs text-[#64748B]">DB Query Latency (live)</div>
        </div>

        {/* Services Online — real computed count */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <Server className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] mb-0.5">
            {loading ? (
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
            ) : data ? (
              `${operationalCount} / ${data.services.length}`
            ) : "—"}
          </div>
          <div className="text-xs text-[#64748B]">Services Operational</div>
        </div>

      </div>

    </div>
  );
}
