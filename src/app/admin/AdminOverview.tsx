import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Upload, FileSearch, Bot, BarChart3, History,
  Settings, HelpCircle, LogOut, Shield, Bell, Search,
  AlertTriangle, AlertCircle, CheckCircle2, X, Copy, Download,
  Trash2, Filter, Send, Zap, Lock, Activity, Target,
  ArrowRight, Eye, EyeOff, BookOpen, MessageSquare, Video,
  ThumbsUp, ThumbsDown, RefreshCw, ChevronDown, Menu, Key,
  User, FileText, TrendingUp, TrendingDown, Star, Check, Info,
  Palette, Database, Users, ServerCrash, Cpu, Globe,
  UserCheck, UserX, MoreHorizontal, ShieldCheck, ShieldAlert,
  BarChart2, ClipboardList, Crown, Sliders
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
} from "recharts";


import { Severity, SEV_CFG, SeverityBadge, ScoreRing, ProgressBar, Toggle } from '../shared/helpers';
import { authFetch } from '../shared/api';

interface ActivityDay {
  date: string;
  day: string;
  analyses: number;
}

interface SystemHealth {
  database: string;
  database_latency_ms: number | null;
  gemini_api: string;
  system_status: string;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  total_analyses: number;
  analyses_today: number;
  total_issues: number;
  critical_issues: number;
  activity_7d?: ActivityDay[];
  system_health?: SystemHealth;
}

interface AdminUserRecord {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  analyses: number;
  total_issues: number;
  joined: string;
  lastActive: string;
}

// ─── ADMIN: SYSTEM OVERVIEW ───────────────────────────────────────────────────

export function AdminOverview({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('http://127.0.0.1:8000/api/admin/stats').then(r => r.json()),
      authFetch('http://127.0.0.1:8000/api/admin/users').then(r => r.json())
    ]).then(([statsData, usersData]) => {
      setStats(statsData);
      setUsers(usersData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { label: "Total Users", value: stats?.total_users ?? 0, change: `${stats?.active_users ?? 0} active`, icon: Users, color: "#7C3AED", bg: "bg-purple-50" },
    { label: "Total Analyses", value: stats?.total_analyses ?? 0, change: "All-time scans", icon: FileSearch, color: "#2563EB", bg: "bg-blue-50" },
    { label: "Analyses Today", value: stats?.analyses_today ?? 0, change: "Since 00:00 UTC", icon: Activity, color: "#06B6D4", bg: "bg-cyan-50" },
    { label: "Total Issues", value: stats?.total_issues ?? 0, change: "Quality & Security", icon: Target, color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Critical Issues", value: stats?.critical_issues ?? 0, change: "Across all scans", icon: ShieldAlert, color: "#EF4444", bg: "bg-red-50" },
  ];

  const planStats = [
    { name: "Enterprise", value: users.filter(u => u.plan === "Enterprise").length, color: "#7C3AED" },
    { name: "Pro", value: users.filter(u => u.plan === "Pro").length, color: "#2563EB" },
    { name: "Free", value: users.filter(u => u.plan === "Free").length, color: "#E2E8F0" },
  ];

  return (
    <div className="p-8 space-y-8 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">System Overview</h1>
        <p className="text-[#64748B] text-sm mt-1">Platform-wide analytics and health monitoring</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-2xl font-bold text-[#0F172A] mb-0.5">{value}</div>
            <div className="text-xs text-[#64748B] font-medium mb-1 leading-tight">{label}</div>
            <div className="text-xs text-[#94A3B8]">{change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#0F172A]">Platform Activity</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Daily analysis volume (last 7 days)</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />Analyses</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-52 text-sm text-[#94A3B8]">
              Loading activity...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={stats?.activity_7d ?? []}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="analyses" stroke="#7C3AED" strokeWidth={2} fill="url(#actGrad)" name="Analyses" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="font-bold text-[#0F172A] mb-0.5">User Plans</h3>
          <p className="text-xs text-[#64748B] mb-4">Distribution by plan tier</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={planStats} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {planStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {planStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
                  <span className="text-[#64748B]">{stat.name}</span>
                </div>
                <span className="font-semibold text-[#0F172A]">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users + system status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
            <h3 className="font-bold text-[#0F172A]">Recent Users</h3>
            <button onClick={() => onNavigate("users")} className="text-xs text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-1">
              Manage all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-[#F8FAFC]">
                {["User", "Plan", "Analyses", "Total Issues", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-3 text-center text-sm text-[#64748B]">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-3 text-center text-sm text-[#64748B]">No users found</td></tr>
                ) : users.slice(0, 5).map(u => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{u.name ? u.name.split(" ").map(n => n[0]).join("").substring(0,2) : "U"}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#0F172A]">{u.name}</div>
                          <div className="text-xs text-[#94A3B8]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                        ${u.plan === "Enterprise" ? "bg-purple-100 text-purple-700" : u.plan === "Pro" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{u.analyses}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{u.total_issues}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System health */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="font-bold text-[#0F172A] mb-4">System Health</h3>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${stats?.system_health?.database === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">PostgreSQL Database</div>
                  <div className="text-[11px] text-[#64748B]">PostgreSQL live connection</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stats?.system_health?.database === "Connected" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {stats?.system_health?.database ?? "Checking..."} {stats?.system_health?.database_latency_ms != null ? `(${stats.system_health.database_latency_ms}ms)` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${stats?.system_health?.gemini_api === "Configured" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">Gemini AI API</div>
                  <div className="text-[11px] text-[#64748B]">Code analysis & AI chat</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stats?.system_health?.gemini_api === "Configured" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {stats?.system_health?.gemini_api ?? "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">Analysis Engines</div>
                  <div className="text-[11px] text-[#64748B]">Pylint & Bandit linters</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">Authentication Guard</div>
                  <div className="text-[11px] text-[#64748B]">Database-backed JWT tokens</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Active
              </span>
            </div>
          </div>

          <div className={`mt-5 p-3 rounded-xl flex items-center gap-2 ${stats?.system_health?.system_status === "Operational" ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${stats?.system_health?.system_status === "Operational" ? "text-emerald-600" : "text-amber-600"}`} />
            <span className={`text-xs font-semibold ${stats?.system_health?.system_status === "Operational" ? "text-emerald-700" : "text-amber-700"}`}>
              {stats?.system_health?.system_status === "Operational" ? "All core services verified and operational" : "System operational with warnings"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
