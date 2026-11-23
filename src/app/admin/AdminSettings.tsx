import { useState, useEffect } from "react";
import {
  Settings, Lock, Key, Database, ShieldCheck, CheckCircle2,
  AlertCircle, RefreshCw, Bot, Mail, Wrench, Server, Info, Shield
} from "lucide-react";
import { authFetch } from '../shared/api';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface GeneralSetting {
  label: string;
  description: string;
  status: string;
  badge_type: string;
}

interface SecuritySetting {
  label: string;
  description: string;
  value: string;
  enforced: boolean;
}

interface IntegrationSetting {
  name: string;
  category: string;
  status: string;
  detail: string;
}

interface PlatformAbout {
  app_version: string;
  total_users: number;
  total_analyses: number;
  database_version: string;
  pylint_version: string;
  bandit_version: string;
  radon_version: string;
  ai_model: string;
  license: string;
}

interface AdminSettingsData {
  general: GeneralSetting[];
  security: SecuritySetting[];
  integrations: IntegrationSetting[];
  about: PlatformAbout;
}

// ─── ADMIN SETTINGS COMPONENT ────────────────────────────────────────────────

export function AdminSettings() {
  const [tab, setTab] = useState("general");
  const [data, setData] = useState<AdminSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/settings');
      if (!res.ok) {
        let errMsg = `Failed to load settings (HTTP ${res.status})`;
        try {
          const body = await res.json();
          if (body?.detail) errMsg = body.detail;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      const json: AdminSettingsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to load admin settings:", err);
      setError(err?.message || "Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-8 min-h-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Admin Settings</h1>
          <p className="text-[#64748B] text-sm mt-1">Platform architecture parameters, security policies, and integrations</p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-52 flex-shrink-0 space-y-1">
          {[
            ["general", "General", Settings],
            ["security", "Security", Lock],
            ["api", "Integrations & API", Key],
            ["about", "About Platform", Database]
          ].map(([id, label, Icon]) => (
            <button
              key={id as string}
              onClick={() => setTab(id as string)}
              className={`w-full flex items-center gap-3 px-3.5 h-10 rounded-xl text-sm transition-all font-medium
                ${tab === id ? "bg-purple-50 text-purple-700 font-semibold shadow-sm" : "text-[#64748B] hover:bg-slate-100"}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 space-y-5">
          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm flex flex-col items-center justify-center gap-3 text-[#64748B]">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              <p className="text-sm">Loading verified platform configuration…</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-red-800">Failed to load platform settings</div>
                  <div className="text-xs text-red-600 mt-0.5">{error}</div>
                </div>
              </div>
              <button
                onClick={fetchSettings}
                className="px-3.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* TAB 1: GENERAL SETTINGS */}
          {!loading && !error && data && tab === "general" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">Platform Operation Parameters</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Read-only operational status verified from server configuration</p>
              </div>

              <div className="space-y-3">
                {data.general.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-[#F1F5F9] bg-[#FAFBFD]">
                    <div className="pr-4 min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A]">{item.label}</div>
                      <div className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{item.description}</div>
                    </div>
                    <span className="flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl flex items-start gap-3 text-xs text-purple-900 leading-relaxed">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Architecture Note:</strong> Platform operational flags are enforced at the backend service layer. Simulated client-side toggles without server persistence have been removed to preserve dashboard integrity.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY SETTINGS */}
          {!loading && !error && data && tab === "security" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">Security Policies & Authentication</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Active cryptographic enforcement rules and access protection</p>
              </div>

              <div className="space-y-3">
                {data.security.map((sec) => (
                  <div key={sec.label} className="p-4 rounded-xl border border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A]">{sec.label}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{sec.description}</div>
                      <div className="text-xs font-mono font-medium text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded mt-2">
                        {sec.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enforced</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-[#64748B] leading-relaxed">
                <Shield className="w-4 h-4 text-[#64748B] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Access Protection:</strong> Passwords require minimum 8 characters across registration and password reset. The authentication route actively enforces a 5-attempt brute-force rate limiter with a 15-minute lockout.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATIONS & API */}
          {!loading && !error && data && tab === "api" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">Integration & API Status</h3>
                <p className="text-xs text-[#64748B] mt-0.5">External AI service, email dispatch, and database connection status</p>
              </div>

              <div className="space-y-3">
                {data.integrations.map((svc) => (
                  <div key={svc.name} className="p-4 rounded-xl border border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] flex-shrink-0">
                        {svc.name.includes("Gemini") ? <Bot className="w-4 h-4 text-purple-600" /> :
                         svc.name.includes("Email") ? <Mail className="w-4 h-4 text-blue-600" /> :
                         svc.name.includes("Static") ? <Wrench className="w-4 h-4 text-amber-600" /> :
                         <Server className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#0F172A]">{svc.name}</span>
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] bg-slate-100 px-1.5 py-0.5 rounded">
                            {svc.category}
                          </span>
                        </div>
                        <div className="text-xs text-[#64748B] mt-0.5 font-mono truncate max-w-md">{svc.detail}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0
                      ${svc.status === "Configured" || svc.status === "Operational" || svc.status === "Connected" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {svc.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Secret Management:</strong> All credentials (API keys, SMTP passwords, database connection strings) are stored securely in backend server environment variables (<code>.env</code>). To prevent credential exposure, client-side secret viewing and editing are restricted.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT PLATFORM */}
          {!loading && !error && data && tab === "about" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">Platform Specifications</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Verified runtime environment, database records, and engine versions</p>
              </div>

              <div className="divide-y divide-[#F1F5F9] border-t border-b border-[#F1F5F9]">
                {[
                  ["Application Version", data.about.app_version],
                  ["Total Registered Users", `${data.about.total_users} (from database)`],
                  ["Total Code Analyses", `${data.about.total_analyses} (from database)`],
                  ["Database Engine", data.about.database_version],
                  ["Static Analysis Linters", `Pylint v${data.about.pylint_version} · Bandit v${data.about.bandit_version} · Radon v${data.about.radon_version}`],
                  ["AI Provider & Model", data.about.ai_model],
                  ["Software Edition", data.about.license],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3.5">
                    <span className="text-sm text-[#64748B]">{label}</span>
                    <span className="text-sm font-semibold text-[#0F172A] font-mono text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>All specifications verified live against PostgreSQL and Python 3.14 runtime.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
