import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Settings,
  UserCheck,
  UserX,
  X,
  FileText,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Key,
  Shield,
} from "lucide-react";
import { authFetch, getSavedUser } from "../shared/api";

interface AdminUserRecord {
  id: number;
  name: string;
  email: string;
  username?: string;
  role?: string;
  phone?: string;
  plan: string;
  status: string;
  analyses: number;
  total_issues: number;
  joined: string;
  lastActive: string;
}

export function UserManagement({ currentUser }: { currentUser?: any }) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // View User Modal State
  const [viewUser, setViewUser] = useState<AdminUserRecord | null>(null);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Edit User Modal State
  const [editUser, setEditUser] = useState<AdminUserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editPlan, setEditPlan] = useState("Free");
  const [editStatus, setEditStatus] = useState("active");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Invite / Create User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [invitePlan, setInvitePlan] = useState("Free");
  const [inviteStatus, setInviteStatus] = useState("active");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const activeAdmin = currentUser || getSavedUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to page 1 whenever search, filter, or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [search, filter, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/admin/users");
      if (!res.ok) {
        throw new Error(`Failed to load users (Status ${res.status})`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError(err?.message || "Failed to load user directory.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (u: AdminUserRecord) => {
    setViewUser(u);
    setReportsLoading(true);
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/admin/analyses");
      if (res.ok) {
        const data = await res.json();
        const userScans = data.filter((r: any) => r.user === u.email);
        setUserReports(userScans);
      } else {
        setUserReports([]);
      }
    } catch (err) {
      console.error("Failed to load user analyses:", err);
      setUserReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const toggleUserStatus = async (targetUser: AdminUserRecord) => {
    if (activeAdmin && targetUser.id === activeAdmin.id) {
      alert("You cannot suspend your own administrator account.");
      return;
    }
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/admin/users/${targetUser.id}/status`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Failed to update user status.");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: data.status } : u))
      );
      setSuccessMessage(`User #${targetUser.id} is now ${data.status}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Open Edit User Modal
  const handleOpenEditModal = (u: AdminUserRecord) => {
    setEditUser(u);
    setEditName(u.name || "");
    setEditUsername(u.username || "");
    setEditEmail(u.email || "");
    setEditRole(u.role || "user");
    setEditPlan(u.plan || "Free");
    setEditStatus(u.status || "active");
    setEditError(null);
  };

  // Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError(null);

    const trimmedName = editName.trim();
    if (trimmedName.length < 2) {
      setEditError("Full name must be at least 2 characters.");
      return;
    }
    const trimmedUser = editUsername.trim();
    if (trimmedUser.length < 3) {
      setEditError("Username must be at least 3 characters.");
      return;
    }
    const trimmedEmail = editEmail.trim();
    if (!trimmedEmail.includes("@")) {
      setEditError("Please enter a valid email address.");
      return;
    }

    setEditLoading(true);
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/admin/users/${editUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUser,
          email: trimmedEmail,
          role: editRole,
          plan: editPlan,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update user.");
      }

      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...data } : u)));
      setEditUser(null);
      setSuccessMessage(`User ${data.name} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setEditError(err.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  // Generate secure temporary password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInvitePassword(pwd);
  };

  // Submit Invite / Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    const trimmedName = inviteName.trim();
    if (trimmedName.length < 2) {
      setInviteError("Full name must be at least 2 characters.");
      return;
    }
    const trimmedUser = inviteUsername.trim();
    if (trimmedUser.length < 3) {
      setInviteError("Username must be at least 3 characters.");
      return;
    }
    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    if (invitePassword.length < 8) {
      setInviteError("Password must be at least 8 characters.");
      return;
    }

    setInviteLoading(true);
    try {
      const res = await authFetch("http://127.0.0.1:8000/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          username: trimmedUser,
          password: invitePassword,
          role: inviteRole,
          plan: invitePlan,
          status: inviteStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create user.");
      }

      setUsers((prev) => [data, ...prev]);
      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInviteUsername("");
      setInvitePassword("");
      setInviteRole("user");
      setInvitePlan("Free");
      setInviteStatus("active");

      setSuccessMessage(`User ${data.name} (${data.email}) created successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setInviteError(err.message || "Failed to create user.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Search and Filter logic
  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      u.status.toLowerCase() === filter.toLowerCase() ||
      u.plan.toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  // Real Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);

  function toggle(id: number) {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="p-8 space-y-6 min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">User Management</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage accounts, plans, roles, and access permissions</p>
        </div>
        <button
          onClick={() => {
            setShowInviteModal(true);
            setInviteError(null);
            generateRandomPassword();
          }}
          className="flex items-center gap-2 h-10 px-5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-purple-500/20"
        >
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between gap-3 text-green-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold text-red-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-[#0F172A]", bg: "bg-slate-50" },
          {
            label: "Active",
            value: users.filter((u) => u.status === "active").length,
            color: "text-green-700",
            bg: "bg-green-50",
          },
          {
            label: "Suspended",
            value: users.filter((u) => u.status === "suspended").length,
            color: "text-red-700",
            bg: "bg-red-50",
          },
          {
            label: "Enterprise",
            value: users.filter((u) => u.plan === "Enterprise").length,
            color: "text-purple-700",
            bg: "bg-purple-50",
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-sm`}>
            <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-[#64748B] font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, username, email…"
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {["all", "active", "suspended", "enterprise", "pro", "free"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-10 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-[#CBD5E1] accent-purple-600"
                    onChange={(e) =>
                      setSelected(e.target.checked ? paginatedUsers.map((u) => u.id) : [])
                    }
                    checked={
                      selected.length === paginatedUsers.length && paginatedUsers.length > 0
                    }
                  />
                </th>
                {["User", "Role", "Plan", "Analyses", "Issues", "Joined", "Last Active", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Loading user directory…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#64748B]">
                    <p className="font-semibold text-[#0F172A] mb-1">No users found</p>
                    <p className="text-xs text-[#64748B]">
                      {search || filter !== "all"
                        ? "Try clearing your search query or filters to see all users."
                        : "No user records registered."}
                    </p>
                    {(search || filter !== "all") && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setFilter("all");
                        }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold rounded-lg transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isSelf = activeAdmin && u.id === activeAdmin.id;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        selected.includes(u.id) ? "bg-purple-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(u.id)}
                          onChange={() => toggle(u.id)}
                          className="rounded border-[#CBD5E1] accent-purple-600"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-xs font-bold">
                              {u.name
                                ? u.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "U"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <span className="truncate">{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#94A3B8] truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            u.plan === "Enterprise"
                              ? "bg-purple-100 text-purple-700"
                              : u.plan === "Pro"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-[#0F172A]">{u.analyses}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-[#0F172A]">{u.total_issues}</td>
                      <td className="px-4 py-3.5 text-xs text-[#94A3B8] whitespace-nowrap">{u.joined}</td>
                      <td className="px-4 py-3.5 text-xs text-[#94A3B8] whitespace-nowrap">{u.lastActive}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                            u.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewUser(u)}
                            className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-[#64748B] hover:text-blue-600 transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-[#64748B] hover:text-amber-600 transition-colors"
                            title="Edit User"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            disabled={isSelf}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isSelf
                                ? "opacity-30 cursor-not-allowed text-[#94A3B8]"
                                : u.status === "active"
                                ? "hover:bg-red-50 text-[#64748B] hover:text-red-600"
                                : "hover:bg-green-50 text-[#64748B] hover:text-green-600"
                            }`}
                            title={
                              isSelf
                                ? "Cannot suspend own account"
                                : u.status === "active"
                                ? "Suspend User"
                                : "Activate User"
                            }
                          >
                            {u.status === "active" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Real Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#64748B]">
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} users
            {filtered.length !== users.length && ` (filtered from ${users.length} total)`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-[#64748B] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === p
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[#64748B] hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-[#64748B] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editUser && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditUser(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">Edit User Account</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Modify account settings, permissions, and subscription</p>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    disabled={activeAdmin && editUser.id === activeAdmin.id}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Plan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={activeAdmin && editUser.id === activeAdmin.id}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-50"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {activeAdmin && editUser.id === activeAdmin.id && (
                <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>You cannot demote or suspend your own active administrator account.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE / CREATE USER MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">Create New User</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Provision an active account with an administrator-assigned password</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Taylor"
                  required
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Username</label>
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="alextaylor"
                    required
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#0F172A]">Initial Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-purple-700 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" /> Generate Secure
                  </button>
                </div>
                <input
                  type="text"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  className="w-full h-9 px-3 font-mono border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Note: The account is created immediately in the database without sending an email invitation. Securely communicate these credentials to the user.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Plan</label>
                  <select
                    value={invitePlan}
                    onChange={(e) => setInvitePlan(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Status</label>
                  <select
                    value={inviteStatus}
                    onChange={(e) => setInviteStatus(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {inviteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {viewUser && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewUser(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">User Details</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Account profile and scan activity overview</p>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#F1F5F9] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0">
                {viewUser.name
                  ? viewUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A] truncate">{viewUser.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      viewUser.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {viewUser.status}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      viewUser.role === "admin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {viewUser.role || "user"}
                  </span>
                </div>
                <div className="text-xs text-[#64748B] truncate mt-0.5">{viewUser.email}</div>
                <div className="mt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      viewUser.plan === "Enterprise"
                        ? "bg-purple-100 text-purple-700"
                        : viewUser.plan === "Pro"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {viewUser.plan} Plan
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">User ID</div>
                  <div className="text-sm font-bold text-[#0F172A] mt-0.5">#{viewUser.id}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">Account Status</div>
                  <div className="text-sm font-bold capitalize text-[#0F172A] mt-0.5">{viewUser.status}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">Total Analyses</div>
                  <div className="text-sm font-bold text-[#0F172A] mt-0.5">{viewUser.analyses} scans</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">Total Issues Found</div>
                  <div className="text-sm font-bold text-[#0F172A] mt-0.5">{viewUser.total_issues} issues</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">Joined Date</div>
                  <div className="text-sm font-bold text-[#0F172A] mt-0.5">{viewUser.joined}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-[#64748B]">Last Active Date</div>
                  <div className="text-sm font-bold text-[#0F172A] mt-0.5">{viewUser.lastActive}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Recent Scans ({userReports.length})
                </h4>
                {reportsLoading ? (
                  <div className="text-xs text-[#64748B] p-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                    Loading analysis reports...
                  </div>
                ) : userReports.length === 0 ? (
                  <div className="text-xs text-[#94A3B8] p-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                    No analysis reports found for this user.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userReports.slice(0, 4).map((r: any) => (
                      <div
                        key={r.id}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="font-medium text-[#0F172A] truncate">{r.file}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 text-[#64748B]">
                          <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {r.issues} issues
                          </span>
                          <span className="text-[11px] text-[#94A3B8]">{r.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-sm font-medium text-[#0F172A] rounded-xl transition-colors shadow-sm"
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
