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


// ─── HELPERS ──────────────────────────────────────────────────────────────────

export type Severity = "Critical" | "High" | "Medium" | "Low";

export const SEV_CFG: Record<Severity, { bg: string; text: string; dot: string }> = {
  Critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  High: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Low: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const c = SEV_CFG[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {severity}
    </span>
  );
}

export function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#0F172A]">{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-[#64748B]">{label}</span>
    </div>
  );
}

export function ProgressBar({ value, color = "#2563EB" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-blue-600" : "bg-[#CBD5E1]"}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}
