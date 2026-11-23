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

interface AdminReportRecord {
  id: string;
  file: string;
  user: string;
  quality: number;
  security: number;
  issues: number;
  date: string;
}

// ─── ADMIN: ALL REPORTS ───────────────────────────────────────────────────────

export function AllReports() {
  const [reports, setReports] = useState<AdminReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/analyses');
      if (!res.ok) {
        let errMsg = `Failed to fetch reports (HTTP ${res.status})`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errMsg = errData.detail;
          }
        } catch { }
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Expected array from /api/admin/analyses, received:", data);
        setReports([]);
      }
    } catch (err: any) {
      console.error("Failed to load admin analyses:", err);
      setError(err?.message || "Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = (Array.isArray(reports) ? reports : []).filter(r =>
    (r.file || "").toLowerCase().includes(search.toLowerCase()) || (r.user || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      alert("No reports available to export.");
      return;
    }

    const headers = ["Report ID", "Filename", "User Email", "Quality", "Security", "Total Issues", "Date"];

    const escapeCSV = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = filtered.map(r => [
      escapeCSV(r.id),
      escapeCSV(r.file),
      escapeCSV(r.user),
      escapeCSV(`${r.quality}%`),
      escapeCSV(`${r.security}%`),
      escapeCSV(r.issues),
      escapeCSV(r.date)
    ]);

    const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows.map(row => row.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pyguardian_admin_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">All Reports</h1>
        <p className="text-[#64748B] text-sm mt-1">Every analysis across all users on the platform</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by file or user…"
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" />
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          title="Refresh reports"
          className="flex items-center gap-2 h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
        </button>
        <button onClick={handleExportCSV} className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {["ID", "File", "User", "Quality", "Security", "Issues", "Date"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                      <button
                        onClick={fetchReports}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#64748B]">
                    {search ? "No reports match your search criteria." : "No reports found."}
                  </td>
                </tr>
              ) : filtered.map(row => (
                <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3.5 text-xs font-mono text-[#64748B]">{row.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-[#0F172A]">{row.file}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#64748B]">{row.user}</td>
                  <td className="px-4 py-3.5 text-sm text-[#64748B]">{row.quality}%</td>
                  <td className="px-4 py-3.5 text-sm text-[#64748B]">{row.security}%</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-[#0F172A]">{row.issues}</td>
                  <td className="px-4 py-3.5 text-xs text-[#94A3B8] whitespace-nowrap">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
