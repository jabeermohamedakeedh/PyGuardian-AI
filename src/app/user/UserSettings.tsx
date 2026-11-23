import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Database,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Toggle } from "../shared/helpers";
import { authFetch, setAuthSession, getAuthToken } from "../shared/api";

interface UserProfileData {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  plan: string;
  status: string;
  created_at: string;
  ai_model: string;
  engine: string;
  app_version: string;
}

interface NotificationSettings {
  analysis: boolean;
  critical: boolean;
  weekly: boolean;
  updates: boolean;
}

export function UserSettings({
  user,
  onUserUpdate,
}: {
  user?: any;
  onUserUpdate?: (u: any) => void;
}) {
  const [tab, setTab] = useState<"profile" | "security" | "notifications" | "about">("profile");

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Status & Feedback States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences (persisted in localStorage)
  const [notifs, setNotifs] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem("pyguardian_user_notifications");
      return saved ? JSON.parse(saved) : { analysis: true, critical: true, weekly: false, updates: true };
    } catch {
      return { analysis: true, critical: true, weekly: false, updates: true };
    }
  });
  const [notifSavedNotice, setNotifSavedNotice] = useState(false);

  // Fetch real authenticated profile on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingProfile(true);
    authFetch("http://127.0.0.1:8000/api/users/me")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load profile (Status ${res.status})`);
        }
        return res.json();
      })
      .then((data: UserProfileData) => {
        if (isMounted) {
          setProfileData(data);
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");

          if (user && data.plan !== user.plan) {
            if (onUserUpdate) onUserUpdate(data);
            window.dispatchEvent(new CustomEvent("user:updated", { detail: data }));
          }
        }
      })
      .catch((err) => {
        console.error("Could not fetch user profile:", err);
        if (isMounted) {
          // Fall back gracefully to user prop
          if (user) {
            setFullName(user.full_name || "");
            setUsername(user.username || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingProfile(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist notification preferences
  const handleToggleNotif = (key: keyof NotificationSettings) => {
    setNotifs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("pyguardian_user_notifications", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save notification settings", e);
      }
      return updated;
    });
    setNotifSavedNotice(true);
    setTimeout(() => setNotifSavedNotice(false), 2000);
  };

  // Helper for avatar initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    // Client-side Validation
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setProfileError("Full Name must be at least 2 characters long.");
      return;
    }
    const trimmedUser = username.trim();
    if (!trimmedUser || trimmedUser.length < 3) {
      setProfileError("Username must be at least 3 characters long.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          full_name: trimmedName,
          username: trimmedUser,
          email: trimmedEmail,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile.");
      }

      setProfileData(data);
      setFullName(data.full_name);
      setUsername(data.username);
      setEmail(data.email);
      setPhone(data.phone || "");

      // Synchronize session in localStorage & App state
      const token = getAuthToken();
      if (token) {
        setAuthSession(token, data);
      }
      if (onUserUpdate) {
        onUserUpdate(data);
      }
      window.dispatchEvent(new CustomEvent("user:updated", { detail: data }));

      setProfileSuccess("Profile settings updated successfully!");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred while saving profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Change Handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const navItems = [
    { id: "profile" as const, label: "Profile", Icon: User },
    { id: "security" as const, label: "Security", Icon: Shield },
    { id: "notifications" as const, label: "Notifications", Icon: Bell },
    { id: "about" as const, label: "About", Icon: Database },
  ];

  return (
    <div className="p-8 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage your personal account, security, and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
        {/* Navigation Tabs */}
        <nav className="w-full md:w-52 flex-shrink-0 space-y-1">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setProfileError(null);
                setProfileSuccess(null);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-all font-medium ${
                tab === id
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="flex-1 space-y-5">
          {/* TAB 1: PROFILE */}
          {tab === "profile" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              <div className="border-b border-[#F1F5F9] pb-4">
                <h3 className="font-bold text-[#0F172A] text-base">Profile Information</h3>
                <p className="text-[#64748B] text-xs mt-0.5">
                  Update your display name, username, and contact information
                </p>
              </div>

              {/* User Avatar & Status Display */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white text-xl font-bold">{getInitials(fullName || user?.full_name)}</span>
                </div>
                <div>
                  <div className="text-base font-bold text-[#0F172A]">{fullName || user?.full_name || "User"}</div>
                  <div className="text-xs text-[#64748B] mt-0.5">{email || user?.email}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Plan: {profileData?.plan || user?.plan || "Free"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#475569] border border-slate-200">
                      {profileData?.role === "admin" || user?.role === "admin" ? "Administrator" : "Standard User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success & Error Banners */}
              {profileSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-green-800 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                      disabled={savingProfile || loadingProfile}
                      className="w-full h-10 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      required
                      disabled={savingProfile || loadingProfile}
                      className="w-full h-10 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      disabled={savingProfile || loadingProfile}
                      className="w-full h-10 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={savingProfile || loadingProfile}
                      className="w-full h-10 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50"
                    />
                  </div>

                  {/* Read-Only Role */}
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5 flex items-center justify-between">
                      <span>Account Role</span>
                      <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Managed by Administrator
                      </span>
                    </label>
                    <div className="w-full h-10 px-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] flex items-center font-medium select-none">
                      {profileData?.role === "admin" || user?.role === "admin" ? "Administrator" : "Standard User"}
                    </div>
                  </div>

                  {/* Read-Only Plan */}
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5 flex items-center justify-between">
                      <span>Subscription Plan</span>
                      <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Managed by Platform
                      </span>
                    </label>
                    <div className="w-full h-10 px-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] flex items-center font-medium select-none">
                      {profileData?.plan || user?.plan || "Free"}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile || loadingProfile}
                    className="flex items-center justify-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {tab === "security" && (
            <div className="space-y-5">
              {/* Change Password Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
                <div className="border-b border-[#F1F5F9] pb-4">
                  <h3 className="font-bold text-[#0F172A] text-base">Change Password</h3>
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Ensure your account uses a secure password of at least 8 characters
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-green-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={savingPassword}
                        className="w-full h-10 pl-4 pr-10 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        disabled={savingPassword}
                        className="w-full h-10 pl-4 pr-10 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      minLength={8}
                      disabled={savingPassword}
                      className="w-full h-10 px-4 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center justify-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Updating…
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </div>

              {/* Session Security Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-[#0F172A] text-sm">Active Session & Security Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                    <div className="text-xs text-[#64748B] font-medium">Session Expiry</div>
                    <div className="text-sm font-bold text-[#0F172A] mt-1">10,080 minutes (7 days)</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                    <div className="text-xs text-[#64748B] font-medium">Authentication Token</div>
                    <div className="text-sm font-bold text-[#0F172A] mt-1">JWT Bearer (HS256)</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                    <div className="text-xs text-[#64748B] font-medium">Password Protection</div>
                    <div className="text-sm font-bold text-[#0F172A] mt-1">Bcrypt Hashed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div>
                  <h3 className="font-bold text-[#0F172A] text-base">Notification Preferences</h3>
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Control automated alerts and summary reports sent to your account
                  </p>
                </div>
                {notifSavedNotice && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    key: "analysis" as const,
                    label: "Analysis Complete",
                    desc: "Notify when static code scans and AI summaries finish",
                  },
                  {
                    key: "critical" as const,
                    label: "Critical Security Alerts",
                    desc: "Immediate notifications for high and critical vulnerabilities",
                  },
                  {
                    key: "weekly" as const,
                    label: "Weekly Activity Digest",
                    desc: "Weekly summary of code analyses and resolved issues",
                  },
                  {
                    key: "updates" as const,
                    label: "Platform & Rule Updates",
                    desc: "Updates to Pylint, Bandit, and Radon rule definitions",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#F1F5F9] hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{label}</div>
                      <div className="text-xs text-[#64748B]">{desc}</div>
                    </div>
                    <Toggle on={notifs[key]} onToggle={() => handleToggleNotif(key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT (Real Backend Data, Zero Fake GPT-4o) */}
          {tab === "about" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
              <div className="border-b border-[#F1F5F9] pb-4">
                <h3 className="font-bold text-[#0F172A] text-base">About PyGuardian AI</h3>
                <p className="text-[#64748B] text-xs mt-0.5">
                  Platform specifications, active AI model, and account subscription details
                </p>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {[
                  ["Application Version", profileData?.app_version || "1.0.0"],
                  ["Static Analysis Engine", profileData?.engine || "Pylint · Bandit · Radon"],
                  ["AI Analysis Provider", profileData?.ai_model || "Google Gemini (gemini-3.1-flash-lite)"],
                  ["Subscription Plan", profileData?.plan || user?.plan || "Free"],
                  ["Account Status", profileData?.status || user?.status || "active"],
                  ["Account ID", `#USER-${profileData?.id || user?.id || 1}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <span className="text-sm text-[#64748B] font-medium">{label}</span>
                    <span className="text-sm font-semibold text-[#0F172A]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
