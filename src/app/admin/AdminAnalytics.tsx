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

interface MonthlyIssueTrend {
  month: string;
  quality: number;
  security: number;
  complexity: number;
  total: number;
}

interface AdminStats {
  activity_7d?: ActivityDay[];
  monthly_issue_trend?: MonthlyIssueTrend[];
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

// ─── ADMIN: ANALYTICS ─────────────────────────────────────────────────────────

export function AdminAnalytics() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('http://127.0.0.1:8000/api/admin/users').then(r => r.json()),
      authFetch('http://127.0.0.1:8000/api/admin/stats').then(r => r.json()),
    ])
      .then(([usersData, statsData]) => {
        setUsers(usersData);
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-8 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Platform Analytics</h1>
        <p className="text-[#64748B] text-sm mt-1">Deep insights into platform usage and analysis trends</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[#0F172A]">Issue Trend (Platform-wide)</h3>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Quality</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />Security</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Complexity</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mb-5">Monthly category breakdown across all scans</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.monthly_issue_trend || []}>
              <defs>
                <linearGradient id="gaQuality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gaSecurity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
              <Area type="monotone" dataKey="quality" stroke="#3B82F6" strokeWidth={2} fill="url(#gaQuality)" name="Quality" />
              <Area type="monotone" dataKey="security" stroke="#7C3AED" strokeWidth={2} fill="url(#gaSecurity)" name="Security" />
              <Area type="monotone" dataKey="complexity" stroke="#F59E0B" strokeWidth={2} fill="none" name="Complexity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[#0F172A]">Analyses by Day</h3>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>Analyses</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mb-5">Daily activity for the last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.activity_7d || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
              <Bar dataKey="analyses" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Analyses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="font-bold text-[#0F172A] mb-4">Top Users by Analysis Count</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-[#64748B]">Loading top users...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-[#64748B]">No users found.</div>
          ) : users.sort((a, b) => b.analyses - a.analyses).map((u, i) => (
            <div key={u.id} className="flex items-center gap-4">
              <span className="text-sm font-bold text-[#94A3B8] w-6 text-right">#{i + 1}</span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{u.name ? u.name.split(" ").map(n => n[0]).join("").substring(0,2) : "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#0F172A]">{u.name}</span>
                  <span className="text-sm font-bold text-[#0F172A]">{u.analyses}</span>
                </div>
                <ProgressBar value={(u.analyses / (users[0]?.analyses || 1)) * 100} color="#7C3AED" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
