import { useState, useEffect } from "react";
import { FileText, History } from "lucide-react";
import { authFetch } from "../shared/api";

interface AnalysisRecord {
  id: number;
  filename: string;
  quality_score: number;
  security_score: number;
  complexity_score: number;
  issue_count: number;
  created_at: string;
}

export function HistoryPage({ user }: { user?: any }) {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    authFetch(`http://127.0.0.1:8000/api/analyses/${user.id}`)
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } catch { return { date: iso, time: "" }; }
  };

  return (
    <div className="p-8 space-y-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">History</h1>
        <p className="text-[#64748B] text-sm mt-1">Timeline of your analysis sessions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#94A3B8] text-sm">Loading history…</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
              <History className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">No history yet</h2>
            <p className="text-[#64748B] text-sm max-w-md leading-relaxed">
              Once you upload and analyse Python files, each session will be recorded here as a timeline.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative max-w-3xl">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#E2E8F0]" />
          <div className="space-y-5">
            {records.map(row => {
              const { date, time } = formatDate(row.created_at);
              return (
                <div key={row.id} className="relative pl-14">
                  <div className="absolute left-3 top-5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-[#0F172A]">{row.filename}</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">Completed</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#94A3B8]">{date}</div>
                        <div className="text-xs text-[#CBD5E1]">{time}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-[#64748B]">
                      <span>Issues: <strong className="text-[#0F172A]">{row.issue_count}</strong></span>
                      <span>Quality: <strong className="text-[#0F172A]">{Math.round(row.quality_score)}%</strong></span>
                      <span>Security: <strong className="text-[#0F172A]">{Math.round(row.security_score)}%</strong></span>
                      <span>Complexity: <strong className="text-[#0F172A]">{Math.round(row.complexity_score)}%</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
