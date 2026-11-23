import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  Filter,
  Trash2,
  Eye,
  ClipboardList,
  Sliders,
  RotateCcw,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { authFetch } from "../shared/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AnalysisRecord {
  id: number;
  filename: string;
  quality_score: number;
  security_score: number;
  complexity_score: number;
  issue_count: number;
  issues_json: string;
  summary: string;
  created_at: string;
}

type CategoryFilter = "all" | "security" | "quality" | "complexity" | "clean";
type DateFilter = "all" | "24h" | "7d" | "30d";
type SortOption =
  | "newest"
  | "oldest"
  | "most_issues"
  | "fewest_issues"
  | "quality_asc"
  | "security_asc"
  | "complexity_asc";

export function UserReports({ user, onNavigate }: { user?: any; onNavigate?: (p: string) => void }) {
  const [reports, setReports] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  // Filter & sort states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const fetchReports = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/analyses/${user.id}`);
      if (!res.ok) {
        throw new Error(`Failed to load reports (Status ${res.status})`);
      }
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err?.message || "Failed to load reports. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  function hasCategoryIssue(r: AnalysisRecord, cat: CategoryFilter): boolean {
    if (cat === "clean") {
      return r.issue_count === 0;
    }
    if (cat === "quality" && r.quality_score < 100) return true;
    if (cat === "security" && r.security_score < 100) return true;
    if (cat === "complexity" && r.complexity_score < 100) return true;

    try {
      const issues = JSON.parse(r.issues_json || "[]");
      if (Array.isArray(issues)) {
        return issues.some((i: any) => {
          const c = (i.category || "").toLowerCase();
          const t = (i.tool || "").toLowerCase();
          if (cat === "quality") return c === "quality" || t === "pylint";
          if (cat === "security") return c === "security" || t === "bandit";
          if (cat === "complexity") return c === "complexity" || t === "radon";
          return false;
        });
      }
    } catch {
      // ignore JSON parse error
    }
    return false;
  }

  function matchesDate(r: AnalysisRecord, period: DateFilter): boolean {
    if (period === "all") return true;
    if (!r.created_at) return true;
    try {
      const recordTime = new Date(r.created_at).getTime();
      if (isNaN(recordTime)) return true;
      const now = Date.now();
      if (period === "24h") return now - recordTime <= 24 * 60 * 60 * 1000;
      if (period === "7d") return now - recordTime <= 7 * 24 * 60 * 60 * 1000;
      if (period === "30d") return now - recordTime <= 30 * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
    return true;
  }

  function handleResetFilters() {
    setCategoryFilter("all");
    setDateFilter("all");
    setSortBy("newest");
    setSearch("");
  }

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const filtered = reports
    .filter(r => {
      if (search.trim() && !r.filename.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      if (categoryFilter !== "all" && !hasCategoryIssue(r, categoryFilter)) {
        return false;
      }
      if (dateFilter !== "all" && !matchesDate(r, dateFilter)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "most_issues") {
        return b.issue_count - a.issue_count;
      }
      if (sortBy === "fewest_issues") {
        return a.issue_count - b.issue_count;
      }
      if (sortBy === "quality_asc") {
        return a.quality_score - b.quality_score;
      }
      if (sortBy === "security_asc") {
        return a.security_score - b.security_score;
      }
      if (sortBy === "complexity_asc") {
        return a.complexity_score - b.complexity_score;
      }
      return 0;
    });

  function toggle(id: number) {
    setSelected(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  }

  async function handleDelete(id: number) {
    try {
      await authFetch(`http://127.0.0.1:8000/api/analyses/${id}`, { method: "DELETE" });
      setReports(prev => prev.filter(r => r.id !== id));
      setSelected(prev => prev.filter(x => x !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  async function handleBulkDelete() {
    for (const id of selected) {
      await handleDelete(id);
    }
    setSelected([]);
  }

  function handleView(row: AnalysisRecord) {
    try {
      const issues = JSON.parse(row.issues_json || "[]");
      const data = {
        issues,
        summary: row.summary || "",
        options: { quality: true, security: true, complexity: true },
        quality_score: row.quality_score,
        security_score: row.security_score,
        complexity_score: row.complexity_score,
      };
      localStorage.setItem("latestAnalysis", JSON.stringify(data));
      if (onNavigate) onNavigate("results");
    } catch {
      alert("Could not load analysis details.");
    }
  }

  function handleDownload(row: AnalysisRecord) {
    const issues = (() => {
      try {
        return JSON.parse(row.issues_json || "[]");
      } catch {
        return [];
      }
    })();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PyGuardian AI — Analysis Report", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`File: ${row.filename}   |   Generated: ${new Date().toLocaleString()}`, 14, 32);

    // Scores (Quality, Security, Complexity - No Risk Score)
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Scores", 14, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Quality Score: ${Math.round(row.quality_score)}%`, 14, 64);
    doc.text(`Security Score: ${Math.round(row.security_score)}%`, 14, 71);
    doc.text(`Complexity Score: ${Math.round(row.complexity_score)}%`, 14, 78);
    doc.text(`Total Issues: ${row.issue_count}`, 14, 85);

    // AI Summary
    if (row.summary) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("AI Summary", 14, 100);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const lines = doc.splitTextToSize(row.summary, pageWidth - 28);
      doc.text(lines, 14, 108);
    }

    // Issues Table
    if (issues.length > 0) {
      autoTable(doc, {
        startY: 130,
        head: [["Severity", "Tool", "File", "Line", "Title"]],
        body: issues.map((i: any) => [i.severity, i.tool, i.file, i.line, i.title]),
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
        didParseCell: data => {
          if (data.section === "body" && data.column.index === 0) {
            const t = data.cell.text[0];
            if (t === "Critical") data.cell.styles.fillColor = [239, 68, 68];
            else if (t === "High") data.cell.styles.fillColor = [249, 115, 22];
            else if (t === "Medium") data.cell.styles.fillColor = [245, 158, 11];
            else data.cell.styles.fillColor = [59, 130, 246];
            data.cell.styles.textColor = 255;
          }
        },
      });
    }

    doc.save(`PyGuardian_${row.filename.replace(".py", "")}_Report.pdf`);
  }

  function handleExportAll() {
    if (reports.length === 0) return;

    const escapeCsvCell = (value: any): string => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      "Report ID",
      "Filename",
      "Quality Score (%)",
      "Security Score (%)",
      "Complexity Score (%)",
      "Total Issues",
      "Summary",
      "Created At",
    ];

    const rows = reports.map(r =>
      [
        r.id,
        r.filename,
        Math.round(r.quality_score),
        Math.round(r.security_score),
        Math.round(r.complexity_score),
        r.issue_count,
        r.summary ? r.summary.replace(/[\r\n]+/g, " ").trim() : "",
        r.created_at,
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    const csvContent = "\uFEFF" + [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `PyGuardian_User_Reports_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
          <p className="text-[#64748B] text-sm mt-1">Your analysis history and downloadable reports</p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 h-10 px-4 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}
          <button
            onClick={handleExportAll}
            disabled={reports.length === 0 || loading}
            title={reports.length === 0 ? "No reports to export" : "Export all reports as CSV"}
            className="flex items-center gap-2 h-10 px-5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold text-red-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports by filename…"
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilterPanel(p => !p)}
          className={`flex items-center gap-2 h-10 px-4 border rounded-xl text-sm font-medium transition-colors shadow-sm ${
            showFilterPanel || activeFilterCount > 0
              ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
              : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilterPanel && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-[#0F172A]">Filter & Sort Reports</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Issue Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "security", label: "Security" },
                  { id: "quality", label: "Quality" },
                  { id: "complexity", label: "Complexity" },
                  { id: "clean", label: "Clean (0 Issues)" },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id as CategoryFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === c.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-50 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Date Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Time" },
                  { id: "24h", label: "Past 24h" },
                  { id: "7d", label: "Past 7 Days" },
                  { id: "30d", label: "Past 30 Days" },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDateFilter(d.id as DateFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateFilter === d.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-50 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_issues">Most Issues</option>
                <option value="fewest_issues">Fewest Issues</option>
                <option value="quality_asc">Lowest Quality Score</option>
                <option value="security_asc">Lowest Security Score</option>
                <option value="complexity_asc">Lowest Complexity Score</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#94A3B8] text-sm">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-purple-50 border border-slate-100 flex items-center justify-center mb-5 shadow-sm">
              <ClipboardList className="w-9 h-9 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">
              {reports.length > 0 ? "No matching reports" : "No reports yet"}
            </h2>
            <p className="text-[#64748B] text-sm max-w-md leading-relaxed mb-4">
              {reports.length > 0
                ? "No reports match your current filter or search criteria."
                : "Upload and analyse a Python file to generate your first report."}
            </p>
            {reports.length > 0 && activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-[#CBD5E1] accent-blue-600"
                        onChange={e => setSelected(e.target.checked ? filtered.map(r => r.id) : [])}
                        checked={selected.length === filtered.length && filtered.length > 0}
                      />
                    </th>
                    {["File", "Quality", "Security", "Complexity", "Issues", "Date", "Actions"].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filtered.map(row => (
                    <tr
                      key={row.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        selected.includes(row.id) ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggle(row.id)}
                          className="rounded border-[#CBD5E1] accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-[#0F172A]">{row.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#64748B]">{Math.round(row.quality_score)}%</td>
                      <td className="px-4 py-3.5 text-sm text-[#64748B]">{Math.round(row.security_score)}%</td>
                      <td className="px-4 py-3.5 text-sm text-[#64748B]">{Math.round(row.complexity_score)}%</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-[#0F172A]">{row.issue_count}</td>
                      <td className="px-4 py-3.5 text-xs text-[#94A3B8] whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleView(row)}
                            title="View Results"
                            className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-[#64748B] hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(row)}
                            title="Download PDF"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-slate-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#64748B] hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3.5 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Showing {filtered.length} of {reports.length} reports
                {activeFilterCount > 0 && " (filtered)"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
