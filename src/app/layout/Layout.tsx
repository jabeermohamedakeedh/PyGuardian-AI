
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

import { Role } from '../shared/constants';
import { Severity, SEV_CFG, SeverityBadge, ScoreRing, ProgressBar, Toggle } from '../shared/helpers';
import { LandingPage, LoginPage, RegisterPage } from '../auth/AuthPages';

import { AdminOverview, UserManagement, AllReports, AdminAnalytics, SystemHealth, AdminSettings } from '../admin/AdminPages';
import { UserDashboard, UploadCode, AnalysisResults, AIAssistant, UserReports, HistoryPage, UserSettings, HelpCenter } from '../user/UserPages';

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export const USER_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload Code", icon: Upload },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

export const ADMIN_NAV = [
  { id: "overview", label: "System Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "allreports", label: "All Reports", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "system", label: "System Health", icon: ServerCrash },
  { id: "settings", label: "Admin Settings", icon: Sliders },
  { id: "help", label: "Help", icon: HelpCircle },
];

export function Sidebar({ current, onNavigate, collapsed, role, user, onLogout }: {
  current: string; onNavigate: (id: string) => void; collapsed: boolean; role: Role; user?: any; onLogout: () => void;
}) {
  const isAdmin = role === "admin";
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;
  const accent = isAdmin ? "bg-purple-600 shadow-purple-600/30" : "bg-blue-600 shadow-blue-600/30";
  const logoGrad = isAdmin ? "from-purple-500 to-pink-600" : "from-blue-500 to-purple-600";
  const getInitials = (name: string) => name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <aside className={`flex flex-col h-full bg-[#0F172A] transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-60"}`}>
      <div className={`flex items-center h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center" : "gap-3 px-4"}`}>
        <div className={`w-8 h-8 bg-gradient-to-br ${logoGrad} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
          {isAdmin ? <Crown className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-none">PyGuardian AI</div>
            <div className={`text-xs font-medium mt-0.5 ${isAdmin ? "text-purple-400" : "text-blue-400"}`}>
              {isAdmin ? "Admin Portal" : "User Portal"}
            </div>
          </div>
        )}
      </div>

      {!collapsed && isAdmin && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrator Mode
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} title={collapsed ? label : undefined}
              className={`w-full flex items-center h-10 rounded-lg transition-all
                ${collapsed ? "justify-center" : "gap-3 px-3"}
                ${active ? `${accent} text-white shadow-lg` : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${logoGrad} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : (isAdmin ? "AD" : "U")}</span>
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.full_name || (isAdmin ? "Administrator" : "User")}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email || (isAdmin ? "admin@pyguardian.ai" : "user@company.com")}</div>
            </div>
          </div>
        )}
        <button onClick={onLogout} title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center h-9 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? "justify-center" : "gap-3 px-3"}`}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────

export interface SearchItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: any;
  category: "Navigation" | "Feature";
}

export const USER_SEARCH_ITEMS: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", description: "View recent scans, quick stats and account summary", keywords: ["dashboard", "home", "stats", "overview"], icon: LayoutDashboard, category: "Navigation" },
  { id: "upload", label: "Upload Code", description: "Upload and analyze Python files for security and quality", keywords: ["upload", "code", "scan", "analyze", "file", "python", "lint"], icon: Upload, category: "Feature" },
  { id: "assistant", label: "AI Assistant", description: "Ask questions about Python code, security and best practices", keywords: ["assistant", "ai", "chat", "bot", "help", "python", "expert"], icon: Bot, category: "Feature" },
  { id: "reports", label: "Reports", description: "Inspect vulnerabilities, filter categories and export CSV data", keywords: ["reports", "export", "csv", "vulnerabilities", "issues", "findings"], icon: BarChart3, category: "Navigation" },
  { id: "history", label: "History", description: "View your past code scans and previous analysis results", keywords: ["history", "past", "scans", "previous", "logs"], icon: History, category: "Navigation" },
  { id: "settings", label: "Settings", description: "Manage your user profile, email and preferences", keywords: ["settings", "profile", "account", "preferences", "password"], icon: Settings, category: "Navigation" },
  { id: "help", label: "Help Center", description: "Documentation, tool guides, FAQs and support information", keywords: ["help", "faq", "docs", "documentation", "support", "contact", "guide"], icon: HelpCircle, category: "Navigation" },
];

export const ADMIN_SEARCH_ITEMS: SearchItem[] = [
  { id: "overview", label: "System Overview", description: "View platform metrics, system load and global totals", keywords: ["overview", "dashboard", "metrics", "stats", "platform"], icon: LayoutDashboard, category: "Navigation" },
  { id: "users", label: "User Management", description: "Manage user accounts, roles, subscription plans and invite users", keywords: ["users", "accounts", "invite", "roles", "plans", "management"], icon: Users, category: "Feature" },
  { id: "allreports", label: "All Reports", description: "Review and export analysis reports across all system users", keywords: ["allreports", "reports", "export", "global", "csv", "vulnerabilities"], icon: ClipboardList, category: "Navigation" },
  { id: "analytics", label: "Analytics", description: "Detailed security trends, vulnerability breakdowns and insights", keywords: ["analytics", "trends", "charts", "breakdown", "metrics"], icon: BarChart2, category: "Navigation" },
  { id: "system", label: "System Health", description: "Monitor database, Gemini AI service and server operational status", keywords: ["system", "health", "status", "uptime", "database", "gemini", "services"], icon: ServerCrash, category: "Navigation" },
  { id: "settings", label: "Admin Settings", description: "Configure system limits, security policies and platform defaults", keywords: ["settings", "admin", "config", "limits", "policies"], icon: Sliders, category: "Navigation" },
  { id: "help", label: "Help Center", description: "Administrator guides, API documentation and support resources", keywords: ["help", "docs", "documentation", "api", "support"], icon: HelpCircle, category: "Navigation" },
];

export function TopNav({
  onToggleSidebar,
  role,
  user,
  onNavigate,
  onLogout
}: {
  onToggleSidebar: () => void;
  role: Role;
  user?: any;
  onNavigate?: (id: string) => void;
  onLogout?: () => void;
}) {
  const isAdmin = role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchableItems = isAdmin ? ADMIN_SEARCH_ITEMS : USER_SEARCH_ITEMS;
  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchResults = cleanQuery
    ? searchableItems.filter(item =>
        item.label.toLowerCase().includes(cleanQuery) ||
        item.description.toLowerCase().includes(cleanQuery) ||
        item.keywords.some(k => k.toLowerCase().includes(cleanQuery))
      )
    : [];

  function handleSelectResult(id: string) {
    onNavigate?.(id);
    setSearchQuery("");
    setIsSearchOpen(false);
  }

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : (isAdmin ? "AD" : "U");
  const displayName = user?.full_name || (isAdmin ? "Administrator" : "User");
  const displayEmail = user?.email || (isAdmin ? "admin@pyguardian.ai" : "user@company.com");
  const displayPlan = isAdmin
    ? "Admin Account"
    : user?.plan
    ? (user.plan.toLowerCase().endsWith("plan") ? user.plan : `${user.plan} Plan`)
    : "Plan";

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white flex items-center px-6 gap-4 flex-shrink-0 relative z-30">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-slate-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Input & Dropdown */}
      <div className="flex-1 max-w-md relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearchOpen(true);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchResults.length > 0) {
                handleSelectResult(searchResults[0].id);
              }
            }}
            placeholder={isAdmin ? "Search admin pages, tools, reports…" : "Search features, pages, reports…"}
            aria-label="Search navigation"
            className="w-full h-9 pl-9 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && cleanQuery && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
              <span>Results for "{searchQuery}"</span>
              <span>{searchResults.length} {searchResults.length === 1 ? "match" : "matches"}</span>
            </div>
            {searchResults.length > 0 ? (
              <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
                {searchResults.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectResult(item.id)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0F172A] group-hover:text-blue-600 transition-colors">{item.label}</span>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.category}</span>
                        </div>
                        <div className="text-xs text-[#64748B] truncate mt-0.5">{item.description}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1.5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center">
                <div className="text-sm font-medium text-[#0F172A]">No matching pages found</div>
                <p className="text-xs text-[#64748B] mt-1">
                  Try searching for {isAdmin ? "'users', 'health', 'settings' or 'reports'" : "'upload', 'reports', 'settings' or 'help'"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {isAdmin && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700">Admin Mode</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Notifications Control */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(prev => !prev)}
            title="Notifications"
            aria-label="View notifications"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center relative text-[#64748B] hover:text-[#0F172A] transition-all"
          >
            <Bell className="w-4 h-4" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="font-semibold text-xs text-[#0F172A] flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#64748B]" />
                  Notifications
                </div>
                <span className="text-[11px] font-medium text-[#64748B] bg-slate-200/60 px-2 py-0.5 rounded-full">
                  0 unread
                </span>
              </div>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-[#94A3B8]">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">No new notifications</div>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  System notifications are not configured. Analysis results and security alerts appear directly within your dashboard and reports.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${isAdmin ? "from-purple-500 to-pink-600" : "from-blue-500 to-purple-600"}`}>
              <span className="text-white text-xs font-bold">{userInitials}</span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-[#0F172A] leading-none">{displayName}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{displayPlan}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Profile Card Header */}
              <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="text-sm font-semibold text-[#0F172A] truncate">{displayName}</div>
                <div className="text-xs text-[#64748B] truncate mt-0.5">{displayEmail}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    {displayPlan}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? "Administrator" : "User Account"}
                  </span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate?.("settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#0F172A] hover:bg-slate-100 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-[#64748B]" />
                  <span>{isAdmin ? "Admin Settings" : "Account Settings"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate?.("help");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#0F172A] hover:bg-slate-100 transition-colors text-left"
                >
                  <HelpCircle className="w-4 h-4 text-[#64748B]" />
                  <span>Help & Documentation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate?.(isAdmin ? "system" : "dashboard");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#0F172A] hover:bg-slate-100 transition-colors text-left"
                >
                  {isAdmin ? <ServerCrash className="w-4 h-4 text-[#64748B]" /> : <LayoutDashboard className="w-4 h-4 text-[#64748B]" />}
                  <span>{isAdmin ? "System Health" : "Dashboard Overview"}</span>
                </button>
              </div>

              {/* Logout Action */}
              <div className="border-t border-[#E2E8F0] p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
