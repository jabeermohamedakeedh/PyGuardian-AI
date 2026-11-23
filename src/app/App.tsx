
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

import { Role } from './shared/constants';
import { Severity, SEV_CFG, SeverityBadge, ScoreRing, ProgressBar, Toggle } from './shared/helpers';
import { getAuthToken, getSavedUser, clearAuthSession, setAuthSession, authFetch } from './shared/api';
import { LandingPage, LoginPage, RegisterPage, ForgotPasswordPage } from './auth/AuthPages';
import { Sidebar, TopNav } from './layout/Layout';
import { AdminOverview, UserManagement, AllReports, AdminAnalytics, SystemHealth, AdminSettings } from './admin/AdminPages';
import { UserDashboard, UploadCode, AnalysisResults, AIAssistant, UserReports, HistoryPage, UserSettings, HelpCenter } from './user/UserPages';

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export type AppState = "landing" | "login" | "register" | "forgot-password" | "app";

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [activeUser, setActiveUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const syncAbortControllerRef = useRef<AbortController | null>(null);

  // Helper to securely sync user profile from backend without race conditions
  const syncUserProfile = (token: string) => {
    if (!token) return;

    // Abort any previous pending verification request to prevent race conditions
    if (syncAbortControllerRef.current) {
      syncAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    syncAbortControllerRef.current = controller;

    authFetch("http://127.0.0.1:8000/api/users/me", { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const freshUser = await res.json();
          // Verify user has not logged out or switched while request was in-flight
          const currentToken = getAuthToken();
          if (currentToken && currentToken === token) {
            setActiveUser(freshUser);
            setAuthSession(token, freshUser);
          }
        }
      })
      .catch((err) => {
        // Ignore aborted requests; silently preserve active user on benign network hiccups
        if (err.name !== "AbortError") {
          // Non-abort error: keep current state without exposing errors
        }
      });
  };

  // Restore authenticated session after page refresh and sync latest profile from backend
  useEffect(() => {
    const savedUser = getSavedUser();
    const token = getAuthToken();
    if (savedUser && token) {
      setActiveUser(savedUser);
      const role = savedUser?.role || "user";
      setCurrentPage(role === "admin" ? "overview" : "dashboard");
      setAppState("app");

      // Verify and refresh session from backend
      syncUserProfile(token);
    }

    // Synchronize user updates across components
    const handleUserUpdated = (e: any) => {
      if (e.detail) {
        setActiveUser(e.detail);
      }
    };
    window.addEventListener("user:updated", handleUserUpdated);

    // Gracefully handle token expiration: clear session and redirect to login
    const handleExpired = () => {
      if (syncAbortControllerRef.current) {
        syncAbortControllerRef.current.abort();
        syncAbortControllerRef.current = null;
      }
      clearAuthSession();
      setActiveUser(null);
      setAppState("login");
      setCurrentPage("dashboard");
      alert("Your session has expired. Please sign in again.");
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => {
      if (syncAbortControllerRef.current) {
        syncAbortControllerRef.current.abort();
        syncAbortControllerRef.current = null;
      }
      window.removeEventListener("auth:expired", handleExpired);
      window.removeEventListener("user:updated", handleUserUpdated);
    };
  }, []);

  function handleLogin(user: any) {
    setActiveUser(user);
    const role = user?.role || "user";
    setCurrentPage(role === "admin" ? "overview" : "dashboard");
    setAppState("app");

    // Immediately sync latest backend profile & plan upon login
    const token = getAuthToken();
    if (token) {
      syncUserProfile(token);
    }
  }

  function handleLogout() {
    // Abort any in-flight profile fetch so it cannot resurrect the session
    if (syncAbortControllerRef.current) {
      syncAbortControllerRef.current.abort();
      syncAbortControllerRef.current = null;
    }
    clearAuthSession();
    setActiveUser(null);
    setAppState("landing");
    setCurrentPage("dashboard");
    setShowLogoutModal(false);
  }

  if (appState === "landing") return <LandingPage onLoginClick={() => setAppState("login")} />;
  if (appState === "register") return (
    <RegisterPage
      onBack={() => setAppState("login")}
      onSuccess={(user: any) => handleLogin(user)}
    />
  );
  if (appState === "login") return (
    <LoginPage
      onLogin={handleLogin}
      onBack={() => setAppState("landing")}
      onRegister={() => setAppState("register")}
      onForgotPassword={() => setAppState("forgot-password")}
    />
  );
  if (appState === "forgot-password") return (
    <ForgotPasswordPage
      onBack={() => setAppState("landing")}
      onLogin={() => setAppState("login")}
    />
  );

  function renderPage() {
    const activeRole = activeUser?.role || "user";
    if (activeRole === "admin") {
      switch (currentPage) {
        case "overview": return <AdminOverview onNavigate={setCurrentPage} />;
        case "users": return <UserManagement />;
        case "allreports": return <AllReports />;
        case "analytics": return <AdminAnalytics />;
        case "system": return <SystemHealth />;
        case "settings": return <AdminSettings />;
        case "help": return <HelpCenter onNavigate={setCurrentPage} />;
        default: return <AdminOverview onNavigate={setCurrentPage} />;
      }
    }
    switch (currentPage) {
      case "dashboard": return <UserDashboard onNavigate={setCurrentPage} user={activeUser} />;
      case "upload": return <UploadCode onNavigate={setCurrentPage} user={activeUser} />;
      case "results": return <AnalysisResults />;
      case "assistant": return <AIAssistant user={activeUser} />;
      case "reports": return <UserReports user={activeUser} onNavigate={setCurrentPage} />;
      case "history": return <HistoryPage user={activeUser} />;
      case "settings": return <UserSettings user={activeUser} onUserUpdate={setActiveUser} />;
      case "help": return <HelpCenter onNavigate={setCurrentPage} />;
      default: return <UserDashboard onNavigate={setCurrentPage} />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>
      <Sidebar current={currentPage} onNavigate={setCurrentPage} collapsed={sidebarCollapsed} role={activeUser?.role || "user"} user={activeUser} onLogout={() => setShowLogoutModal(true)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          role={activeUser?.role || "user"}
          user={activeUser}
          onNavigate={setCurrentPage}
          onLogout={() => setShowLogoutModal(true)}
        />
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>

            {/* Top colored banner */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 to-red-600" />

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FEE2E2, #FECACA)" }}>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <LogOut className="w-7 h-7 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                  Signing Out
                </h3>
                {activeUser?.full_name && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[8px] font-bold">
                        {activeUser.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">{activeUser.full_name}</span>
                  </div>
                )}
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Are you sure you want to log out of your PyGuardian AI account? Your analysis history and reports are safely saved and will be here when you return.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9] mb-6" />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-12 rounded-2xl border-2 border-[#E2E8F0] text-[#64748B] font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-12 rounded-2xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)", boxShadow: "0 4px 15px rgba(220,38,38,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg, #B91C1C, #991B1B)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg, #DC2626, #B91C1C)")}
                >
                  <LogOut className="w-4 h-4" />
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
