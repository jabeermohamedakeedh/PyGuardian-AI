import { useState, useEffect } from "react";
import { FileText, AlertCircle, Lock, Activity, Target, ArrowRight, Upload, TrendingUp, TrendingDown } from "lucide-react";
import { authFetch } from "../shared/api";

interface AnalysisRecord {
  id: number;
  user_id?: number;
  filename: string;
  quality_score: number;
  security_score: number;
  complexity_score: number;
  issue_count: number;
  issues_json?: string;
  summary?: string;
  created_at: string;
}

export function UserDashboard({ onNavigate, user }: { onNavigate: (p: string) => void; user?: any }) {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    Promise.all([
      authFetch(`http://127.0.0.1:8000/api/analyses/${user.id}/stats`).then(r => r.json()),
      authFetch(`http://127.0.0.1:8000/api/analyses/${user.id}`).then(r => r.json()),
    ]).then(([s, records]) => {
      setStats(s);
      setRecent(Array.isArray(records) ? records.slice(0, 5) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const kpis = [
    { label: "Total Analyses", value: stats?.total_analyses ?? 0, icon: FileText, color: "#2563EB", bg: "bg-blue-50" },
    { label: "Total Issues", value: stats?.total_issues ?? 0, icon: Target, color: "#06B6D4", bg: "bg-cyan-50" },
    { label: "Quality Issues", value: stats?.quality_issues ?? 0, icon: AlertCircle, color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Security Issues", value: stats?.security_issues ?? 0, icon: Lock, color: "#EF4444", bg: "bg-red-50" },
    { label: "Complexity Issues", value: stats?.complexity_issues ?? 0, icon: Activity, color: "#7C3AED", bg: "bg-purple-50" },
  ];

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  const handleViewRow = (row: AnalysisRecord) => {
    if (user?.id && row.user_id && row.user_id !== user.id) {
      alert("Access denied: You can only view your own analyses.");
      return;
    }

    try {
      let issues: any[] = [];
      if (row.issues_json) {
        try {
          const parsed = JSON.parse(row.issues_json);
          if (Array.isArray(parsed)) {
            issues = parsed;
          }
        } catch {
          console.warn("Malformed issues_json in record:", row.id);
          issues = [];
        }
      }

      const data = {
        issues,
        summary: row.summary || "",
        options: { quality: true, security: true, complexity: true },
        quality_score: Number(row.quality_score) || 0,
        security_score: Number(row.security_score) || 0,
        complexity_score: Number(row.complexity_score) || 0,
      };

      localStorage.setItem("latestAnalysis", JSON.stringify(data));
      onNavigate("results");
    } catch {
      alert("Could not load analysis details.");
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#64748B] text-sm mt-1">
          {user?.full_name ? `Welcome back, ${user.full_name.split(" ")[0]}! ` : ""}
          Your personal code analysis overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-2xl font-bold text-[#0F172A] mb-0.5">{loading ? "…" : value}</div>
            <div className="text-xs text-[#64748B] font-medium leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h3 className="font-bold text-[#0F172A]">Recent Analyses</h3>
          <button onClick={() => onNavigate("reports")} className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#94A3B8] text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center mb-5 shadow-sm">
              <Upload className="w-9 h-9 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">No analyses yet</h2>
            <p className="text-[#64748B] text-sm max-w-md leading-relaxed mb-6">
              Upload your first Python file to get started. PyGuardian AI will analyse it for quality, security, and complexity.
            </p>
            <button onClick={() => onNavigate("upload")}
              className="flex items-center gap-2 h-11 px-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25">
              <Upload className="w-4 h-4" /> Upload & Analyse Code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {["File", "Quality", "Security", "Complexity", "Issues", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {recent.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => handleViewRow(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleViewRow(row);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors focus:outline-none focus:bg-blue-50/50"
                    title={`Click to view analysis results for ${row.filename}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-[#0F172A]">{row.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{Math.round(row.quality_score)}%</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{Math.round(row.security_score)}%</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{Math.round(row.complexity_score)}%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">{row.issue_count}</td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
