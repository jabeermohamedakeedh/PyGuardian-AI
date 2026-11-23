
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
import { setAuthSession } from '../shared/api';

import { Sidebar, TopNav } from '../layout/Layout';
import { AdminOverview, UserManagement, AllReports, AdminAnalytics, SystemHealth, AdminSettings } from '../admin/AdminPages';
import { UserDashboard, UploadCode, AnalysisResults, AIAssistant, UserReports, HistoryPage, UserSettings, HelpCenter } from '../user/UserPages';

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">PyGuardian AI</div>
            <div className="text-blue-400 text-xs font-medium mt-0.5">Analyze Smarter. Code Safer.</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Already have an account?</span>
          <button onClick={onLoginClick}
            className="h-9 px-5 border border-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/5 transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Python Code Analysis
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-3xl">
          Your Python Code.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
            Secured by AI.
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-12 leading-relaxed">
          Enterprise grade static analysis powered by Pylint, Bandit, and Radon with AI-generated insights to help you fix issues fast.
        </p>

        <button onClick={onLoginClick}
          className="group relative flex items-center justify-center gap-3 h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]">
          Let&apos;s Go <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature strip */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: Lock, label: "Bandit Security" },
            { icon: Activity, label: "Pylint Quality" },
            { icon: Target, label: "Radon Complexity" },
            { icon: Bot, label: "AI Insights" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-500 text-sm">
              <Icon className="w-4 h-4 text-slate-600" />
              {label}
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 text-slate-700 text-xs">
        © 2026 PyGuardian AI-Enterprise Python Security Platform
      </footer>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

export function LoginPage({ onLogin, onBack, onRegister, onForgotPassword }: { onLogin: (user: any) => void; onBack: () => void; onRegister: () => void; onForgotPassword: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || "Invalid credentials. Please check your email and password.");
      } else {
        const data = await response.json();
        if (data.access_token && data.user) {
          setAuthSession(data.access_token, data.user);
        }
        onLogin(data.user || { role: "user" });
      }
    } catch (err) {
      setError("Could not connect to the server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left brand */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8 w-fit">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to landing
          </button>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">PyGuardian AI</div>
              <div className="text-blue-400 text-xs font-medium mt-0.5">
                Unified Portal
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome to PyGuardian AI
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
              Your enterprise-grade Python code analysis and security workspace. Sign in to access your dashboard.
            </p>
            <div className="space-y-4">
              {["Upload & analyze Python files", "AI-powered security insights", "Downloadable PDF reports", "Interactive AI assistant chat"].map(f => (
                <div key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20 text-blue-400">
                    <Check className="w-3 h-3" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="text-slate-700 text-xs">© 2026 PyGuardian AI. All rights reserved.</div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-blue-100 text-blue-700">
              <Key className="w-3.5 h-3.5" />
              Secure Sign In
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">
              Welcome back
            </h2>
            <p className="text-[#64748B]">
              Sign in to your PyGuardian account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#0F172A]">Password</label>
                <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-11 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25">
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in…</>
                : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-4">
            No account?{" "}
            <button onClick={onRegister} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Create one free
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD PAGE ────────────────────────────────────────────────────────

export function ForgotPasswordPage({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setError(""); setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to send reset code.");
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !newPassword) { setError("Please enter the code and a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), new_password: newPassword })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Invalid code or expired.");
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left brand (same as Login) */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col h-full p-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8 w-fit">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to landing
          </button>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"><Shield className="w-5 h-5 text-white" /></div>
            <div><div className="text-white font-bold text-lg leading-none">PyGuardian AI</div><div className="text-blue-400 text-xs font-medium mt-0.5">Unified Portal</div></div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"><Key className="w-10 h-10 text-white" /></div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Secure Password Recovery</h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Regain access to your PyGuardian AI workspace securely using email verification.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button onClick={onLogin} className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
          </button>

          {step === 1 && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Forgot Password?</h2>
                <p className="text-[#64748B]">Enter your email address and we&apos;ll send you a 6-digit recovery code.</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full h-11 px-4 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? "Sending..." : "Send Recovery Code"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Enter Recovery Code</h2>
                <p className="text-[#64748B]">We&apos;ve sent a 6-digit code to <span className="font-semibold text-[#0F172A]">{email}</span>.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">6-Digit Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} required maxLength={6} placeholder="123456"
                    className="w-full h-11 px-4 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                      className="w-full h-11 px-4 pr-11 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Password Reset Successful</h2>
              <p className="text-[#64748B] mb-8">You can now sign in with your new password.</p>
              <button onClick={onLogin} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25">
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────

export function RegisterPage({ onBack, onSuccess }: { onBack: () => void; onSuccess: (user: any) => void }) {
  const [form, setForm] = useState({ fullName: "", username: "", phone: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [realUser, setRealUser] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowTermsModal(false);
        setShowPrivacyModal(false);
      }
    }
    if (showTermsModal || showPrivacyModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showTermsModal, showPrivacyModal]);

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); setErrors(e => ({ ...e, [field]: "" })); }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = "Only letters, numbers and underscores";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email address is required";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (!agreed) errs.agreed = "You must agree to the terms";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          username: form.username,
          phone: form.phone,
          email: form.email,
          password: form.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({ submit: errorData.detail || "Registration failed" });
      } else {
        // Auto-login with the real credentials to get the actual user object
        try {
          const loginRes = await fetch("http://127.0.0.1:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password })
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            if (loginData.access_token && loginData.user) {
              setAuthSession(loginData.access_token, loginData.user);
            }
            setDone(true);
            // Store the real user object to pass on dashboard navigation
            setRealUser(loginData.user);
          } else {
            setDone(true);
          }
        } catch {
          setDone(true);
        }
      }
    } catch (error) {
      setErrors({ submit: "Could not connect to the server. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-2/5 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8 w-fit">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to login
          </button>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">PyGuardian AI</div>
              <div className="text-blue-400 text-xs font-medium mt-0.5">Analyze Smarter. Code Safer.</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
              Start for free.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">No credit card needed.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-xs">
              Join thousands of Python developers who ship safer, cleaner code with PyGuardian AI.
            </p>
            <div className="space-y-5">
              {[
                { icon: Zap, title: "Free plan included", desc: "10 analyses/month at no cost" },
                { icon: Lock, title: "Bank-grade security", desc: "Your code is never stored permanently" },
                { icon: Bot, title: "AI from day one", desc: "Full AI assistant access on signup" },
                { icon: CheckCircle2, title: "No setup required", desc: "Analyze your first file in 30 seconds" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{title}</div>
                    <div className="text-slate-500 text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-slate-700 text-xs">© 2026 PyGuardian AI. All rights reserved.</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] text-sm mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to login
          </button>

          {done ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Account created!</h2>
              <p className="text-[#64748B] mb-2">Welcome to PyGuardian AI, <strong>{form.fullName}</strong>.</p>
              <p className="text-sm text-[#94A3B8] mb-8">A confirmation email has been sent to <strong className="text-[#64748B]">{form.email}</strong></p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 mb-6 text-left">
                <div className="font-semibold mb-1">Your account details:</div>
                <div className="font-mono text-xs space-y-1">
                  <div>Username: <strong>@{form.username}</strong></div>
                  <div>Email: <strong>{form.email}</strong></div>
                  <div>Phone: <strong>{form.phone}</strong></div>
                </div>
              </div>
              <button onClick={() => onSuccess(realUser)}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25">
                Go to Dashboard →
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                  <User className="w-3.5 h-3.5" /> Free Account
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Create your account</h2>
                <p className="text-[#64748B]">Set up your PyGuardian AI workspace in seconds</p>
              </div>



              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.submit}
                  </div>
                )}
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Full Name</label>
                  <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Alex Johnson"
                    className={`w-full h-11 px-4 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.fullName ? "border-red-400 bg-red-50" : "border-[#E2E8F0]"}`} />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm font-medium select-none">@</span>
                    <input value={form.username} onChange={e => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="alexjohnson"
                      className={`w-full h-11 pl-8 pr-4 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.username ? "border-red-400 bg-red-50" : "border-[#E2E8F0]"}`} />
                  </div>
                  {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
                  {!errors.username && form.username && <p className="text-xs text-[#94A3B8] mt-1">Letters, numbers and underscores only</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+94 7X XXX XXXX"
                    className={`w-full h-11 px-4 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.phone ? "border-red-400 bg-red-50" : "border-[#E2E8F0]"}`} />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="alex@example.com"
                    className={`w-full h-11 px-4 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-[#E2E8F0]"}`} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 characters"
                      className={`w-full h-11 px-4 pr-11 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-[#E2E8F0]"}`} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  {/* Strength indicator */}
                  {form.password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[4, 7, 10, 13].map((threshold, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${form.password.length >= threshold
                          ? i < 1 ? "bg-red-400" : i < 2 ? "bg-amber-400" : i < 3 ? "bg-blue-500" : "bg-green-500"
                          : "bg-[#E2E8F0]"}`} />
                      ))}
                      <span className="text-xs text-[#94A3B8] ml-1 self-center">
                        {form.password.length < 4 ? "Weak" : form.password.length < 7 ? "Fair" : form.password.length < 10 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Re-enter your password"
                      className={`w-full h-11 px-4 pr-11 border rounded-xl bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.confirm ? "border-red-400 bg-red-50" : form.confirm && form.confirm === form.password ? "border-green-400" : "border-[#E2E8F0]"}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {form.confirm && form.confirm === form.password && (
                      <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm}</p>}
                </div>

                {/* Terms */}
                <div>
                  <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${errors.agreed ? "border-red-300 bg-red-50" : agreed ? "border-blue-200 bg-blue-50/50" : "border-[#E2E8F0] hover:border-blue-200"}`}>
                    <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(err => ({ ...err, agreed: "" })); }}
                      className="mt-0.5 w-4 h-4 rounded accent-blue-600 flex-shrink-0" />
                    <span className="text-sm text-[#64748B] leading-snug">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTermsModal(true);
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-700 underline focus:outline-none"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPrivacyModal(true);
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-700 underline focus:outline-none"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {errors.agreed && <p className="text-xs text-red-600 mt-1">{errors.agreed}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account…</>
                    : "Create free account"}
                </button>
              </form>

              <p className="text-center text-sm text-[#64748B] mt-5">
                Already have an account?{" "}
                <button onClick={onBack} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 id="terms-modal-title" className="text-lg font-bold text-[#0F172A]">
                    Terms of Service
                  </h3>
                  <p className="text-xs text-[#64748B]">PyGuardian AI Service Agreement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close Terms of Service modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#334155] leading-relaxed">
              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">1. Platform Services</h4>
                <p>
                  PyGuardian AI provides automated static analysis for Python applications. The service evaluates submitted Python code using integrated static engines: Pylint for syntax quality and code conventions, Bandit for security flaw detection, and Radon for cyclomatic complexity analysis. The service also provides automated explanations powered by Google Gemini.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">2. Acceptable Use</h4>
                <p>
                  You agree to use PyGuardian AI strictly for authorized Python code analysis, software improvement, and educational purposes. You must not submit code containing malicious exploits intended to damage systems or use the platform to perform unauthorized scans against third parties.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">3. Advisory Nature of Analysis</h4>
                <p>
                  All metrics, scores, and AI-generated explanations are provided solely for guidance and developer review. Automated static analysis cannot guarantee the detection of all defects or vulnerabilities. You remain solely responsible for the testing, functionality, and security of code deployed to production.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">4. Account Plans and Allocations</h4>
                <p>
                  New accounts are enrolled in the Free plan with an initial allocation of 10 analyses per month. Plan features and limits are managed according to platform terms.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">5. Code Ownership & Record Deletion</h4>
                <p>
                  You retain all rights to the code you analyze. Uploaded code files are processed in temporary storage and erased immediately upon analysis completion. Analysis records and issue metrics are stored in your account history until you or an authorized administrator delete them.
                </p>
              </section>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 id="privacy-modal-title" className="text-lg font-bold text-[#0F172A]">
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-[#64748B]">Data Handling, Storage & Privacy Commitments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                aria-label="Close Privacy Policy modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#334155] leading-relaxed">
              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">1. Temporary Code Processing & Immediate File Erasure</h4>
                <p>
                  When you upload or paste Python source code for analysis, the backend temporarily writes it to a transient file solely to execute the static analysis tools (Pylint, Bandit, Radon). Immediately upon completion of the scan, this temporary file is permanently erased from the server. Your complete source code is never permanently stored in our database.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">2. Persistent Analysis Records</h4>
                <p>
                  To display your historical reports and dashboard metrics, PyGuardian AI stores analysis results in our PostgreSQL database: the filename, timestamp, scores (quality, security, complexity), the count and structured details of identified issues, and the summary text. These analysis records persist until you or an authorized administrator explicitly delete them.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">3. User Deletion Rights</h4>
                <p>
                  You have full authority to delete your analysis records at any time. When you delete an analysis from your Reports view, the record is immediately and permanently removed from the PostgreSQL database.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">4. Account Security & Password Hashing</h4>
                <p>
                  We store your name, username, email address, and phone number to provide account services. Passwords are encrypted prior to storage using salted bcrypt hashing and are never accessible in plaintext. Authentication sessions are secured using JSON Web Tokens (JWT).
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-[#0F172A] mb-1">5. AI Analysis & Gemini Integration</h4>
                <p>
                  Automated issue summaries and the AI Assistant chat are powered by Google Gemini (gemini-3.1-flash-lite). When you request an AI explanation or chat about an issue, only the specific code context or chat prompt is transmitted to the Gemini API. We never sell your personal data or uploaded code.
                </p>
              </section>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
