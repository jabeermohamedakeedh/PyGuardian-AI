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

export function UploadCode({ onNavigate, user }: { onNavigate: (p: string) => void; user?: any }) {
  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [options, setOptions] = useState({ quality: true, security: true, complexity: true });
  const [fileContent, setFileContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<any>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".py")) {
      if (f.size > 1024 * 1024) {
        alert("File is too large! Please upload a file smaller than 1MB to ensure the AI can process it quickly.");
        return;
      }
      setFile(f.name);
      const reader = new FileReader();
      reader.onload = (ev) => setFileContent(ev.target?.result as string || "");
      reader.readAsText(f);
    }
  }

  async function handleAnalyze() {
    // Always clear previous results so old/stale data never leaks into the results page
    localStorage.removeItem("latestAnalysis");
    setAnalyzing(true); setProgress(0); setStage("Preparing analysis...");

    abortControllerRef.current = new AbortController();

    // Fake progress bar while waiting for real backend
    const stages = ["Parsing Python AST…", "Running Pylint…", "Executing Bandit…", "Computing Radon…", "Generating AI insights…"];
    let p = 0; let si = 0; setStage(stages[0]);
    intervalRef.current = setInterval(() => {
      p += Math.random() * 8 + 2; // Slower fake progress to accommodate real backend
      if (p >= 95) p = 95; // Stop at 95% until backend returns
      setProgress(Math.min(p, 100));
      const ns = Math.min(Math.floor((p / 100) * stages.length), stages.length - 1);
      if (ns !== si) { si = ns; setStage(stages[si]); }
    }, 400);

    try {
      const payloadCode = tab === "upload" ? fileContent : code;
      const res = await authFetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: payloadCode, options }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        if (res.status === 413) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.detail || "Python code exceeds the maximum allowed size of 1 MiB (1,048,576 bytes).");
        }
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      data.options = options;
      data._version = Date.now();
      localStorage.setItem("latestAnalysis", JSON.stringify(data));

      // ── Save to database if user is logged in ──────────────────────────
      if (user?.id) {
        const issues = data.issues || [];
        const qualityScore = typeof data.quality_score === "number" ? data.quality_score : 100;
        const securityScore = typeof data.security_score === "number" ? data.security_score : 100;
        const complexityScore = typeof data.complexity_score === "number" ? data.complexity_score : 100;

        try {
          await authFetch("http://127.0.0.1:8000/api/analyses/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              filename: tab === "upload" ? (file || "code.py") : "pasted_code.py",
              risk_score: 0.0,
              quality_score: qualityScore,
              security_score: securityScore,
              complexity_score: complexityScore,
              issue_count: issues.length,
              issues_json: JSON.stringify(issues),
              summary: data.summary || "",
            })
          });
        } catch (saveErr) {
          console.warn("Could not save analysis to database:", saveErr);
        }
      }
      // ──────────────────────────────────────────────────────────────────

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setStage("Analysis complete!");
      setTimeout(() => { setAnalyzing(false); onNavigate("results"); }, 500);
    } catch (err: any) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (err.name === 'AbortError') {
        setAnalyzing(false);
        setStage("");
        return;
      }
      setAnalyzing(false);
      alert(err.message || "Analysis failed. Make sure the backend is running and the API key is valid.");
    }
  }

  function handleStopAnalysis() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setAnalyzing(false);
    setProgress(0);
    setStage("");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Upload Code</h1>
        <p className="text-[#64748B] text-sm mt-1">Analyze your Python code for quality, security, and complexity</p>
      </div>
      <div className="flex bg-[#F1F5F9] rounded-xl p-1 w-fit">
        {(["upload", "paste"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}>
            {t === "upload" ? "Upload File" : "Paste Code"}
          </button>
        ))}
      </div>
      {tab === "upload" ? (
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".py"; i.onchange = (e: Event) => { const t = e.target as HTMLInputElement; if (t.files?.[0]) { const f = t.files[0]; if (f.size > 1024 * 1024) { alert("File is too large! Please upload a file smaller than 1MB to ensure the AI can process it quickly."); return; } setFile(f.name); const r = new FileReader(); r.onload = ev => setFileContent(ev.target?.result as string || ""); r.readAsText(f); } }; i.click(); }}
          className={`rounded-2xl border-2 border-dashed transition-all p-16 text-center cursor-pointer select-none ${dragging ? "border-blue-500 bg-blue-50" : file ? "border-green-400 bg-green-50/50" : "border-[#CBD5E1] hover:border-blue-400 hover:bg-blue-50/30"}`}>
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
              <div className="text-[#0F172A] font-bold text-lg">{file}</div>
              <div className="text-[#64748B] text-sm">File ready for analysis</div>
              <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"><X className="w-3 h-3" /> Remove</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-blue-100" : "bg-[#F1F5F9]"}`}>
                <Upload className={`w-8 h-8 ${dragging ? "text-blue-600" : "text-[#94A3B8]"}`} />
              </div>
              <div>
                <div className="text-[#0F172A] font-bold text-lg mb-1">{dragging ? "Drop it here!" : "Drop your Python file here"}</div>
                <div className="text-[#64748B] text-sm">or click to browse</div>
              </div>
              <span className="px-3 py-1 bg-[#F1F5F9] rounded-full font-mono text-xs text-[#94A3B8]">.py only · Max 1MB</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#EF4444]" /><div className="w-3 h-3 rounded-full bg-[#F59E0B]" /><div className="w-3 h-3 rounded-full bg-[#22C55E]" /></div>
            <span className="text-xs text-[#64748B] font-mono ml-2">paste_code.py</span>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)}
            placeholder={"# Paste your Python code here…\n\nimport os\n\ndef authenticate(user_input):\n    query = f\"SELECT * FROM users WHERE id = {user_input}\"\n    pass"}
            className="w-full h-80 p-5 bg-[#0F172A] text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed" spellCheck={false} />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]">
            <span className="text-xs text-[#94A3B8] font-mono">{code.split("\n").length} lines · {code.length} chars</span>
            <button onClick={() => setCode("")} className="text-xs text-[#64748B] hover:text-red-500 transition-colors">Clear</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="font-bold text-[#0F172A] mb-4">Analysis Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "quality" as const, icon: AlertCircle, label: "Code Quality", desc: "Pylint analysis", color: "text-amber-600", bg: "bg-amber-50" },
            { id: "security" as const, icon: Lock, label: "Security Scan", desc: "Bandit scanner", color: "text-red-600", bg: "bg-red-50" },
            { id: "complexity" as const, icon: Activity, label: "Complexity", desc: "Radon metrics", color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ id, icon: Icon, label, desc, color, bg }) => {
            const isSelected = options[id];
            return (
              <button
                key={id}
                onClick={() => setOptions(prev => ({ ...prev, [id]: !prev[id] }))}
                className={`flex items-center text-left gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/30"
                    : "border-[#E2E8F0] hover:border-blue-200 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div>
                <div className="flex-1"><div className="text-sm font-semibold text-[#0F172A]">{label}</div><div className="text-xs text-[#64748B]">{desc}</div></div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
      {analyzing ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
          <h3 className="font-bold text-[#0F172A] text-lg mb-1">Analyzing…</h3>
          <p className="text-[#64748B] text-sm mb-6">{stage}</p>
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-[#64748B] mb-2"><span>Progress</span><span>{Math.round(progress)}%</span></div>
            <ProgressBar value={progress} color="#2563EB" />
            <button onClick={handleStopAnalysis} className="mt-6 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"><X className="w-4 h-4" /> Stop Analysis</button>
          </div>
        </div>
      ) : (
        <button onClick={handleAnalyze} disabled={!file && !code.trim()}
          className="h-12 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Zap className="w-5 h-5" /> Analyze Code
        </button>
      )}
    </div>
  );
}
