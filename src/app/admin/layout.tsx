"use client";

import { useState, useEffect, useRef, type FormEvent, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Mail,
  Users,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Heart,
  ChevronRight,
  Stethoscope,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  MessageSquareQuote,
  Calculator,
  Shield,
  UserPlus,
  Bell,
  ScrollText,
  HardDriveDownload,
  type LucideIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────
interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "finance" | "editor" | "front_desk";
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const AuthContext = createContext<AuthState>({ user: null, token: null });
export function useAuth() { return useContext(AuthContext); }

const AUTH_STORAGE_KEY = "haven_auth";

// ── Role-based navigation ─────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

const ALL_ROLES = ["admin", "finance", "editor", "front_desk"];

const sidebarLinks: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ALL_ROLES },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar, roles: ALL_ROLES },
  { label: "Clients", href: "/admin/clients", icon: UserPlus, roles: ALL_ROLES },
  { label: "Services", href: "/admin/services", icon: Stethoscope, roles: ["admin", "editor"] },
  { label: "Doctors", href: "/admin/doctors", icon: UserCheck, roles: ["admin", "editor"] },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, roles: ["admin", "editor"] },
  { label: "Blog Posts", href: "/admin/blog", icon: FileText, roles: ["admin", "editor"] },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail, roles: ["admin", "front_desk"] },
  { label: "Subscribers", href: "/admin/subscribers", icon: Users, roles: ["admin", "front_desk"] },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, roles: ["admin", "finance"] },
  { label: "Accounting", href: "/admin/accounting", icon: Calculator, roles: ALL_ROLES },
  { label: "Users", href: "/admin/users", icon: Shield, roles: ["admin"] },
  { label: "Activity Logs", href: "/admin/logs", icon: ScrollText, roles: ["admin"] },
  { label: "Backup", href: "/admin/backup", icon: HardDriveDownload, roles: ["admin"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  finance: "Finance",
  editor: "Editor",
  front_desk: "Front Desk",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400",
  finance: "bg-green-500/20 text-green-400",
  editor: "bg-blue-500/20 text-blue-400",
  front_desk: "bg-amber-500/20 text-amber-400",
};

// ── Login Screen ──────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: data.token,
        user: data.user,
      }));

      onLogin(data.user, data.token);
    } catch {
      setError("Unable to connect. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-dark via-dark to-primary/30 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Haven<span className="text-accent">Admin</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Username</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username" required autoComplete="username"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" required autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            <Lock className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          &copy; {new Date().getFullYear()} Haven Medical. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ── Admin Layout ──────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link: string;
  read: boolean;
  createdAt: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ user: null, token: null });
  const [checking, setChecking] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) { setChecking(false); return; }

    try {
      const parsed = JSON.parse(stored);
      fetch("/api/admin/auth", {
        headers: { "x-auth-token": parsed.token },
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAuth({ user: data.user, token: parsed.token });
        } else {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setChecking(false);
      }).catch(() => {
        setChecking(false);
      });
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setChecking(false);
    }
  }, []);

  const handleLogin = (user: User, token: string) => {
    setAuth({ user, token });
  };

  // ── Notifications ────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.token) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/admin/notifications", {
          headers: { "x-auth-token": auth.token! },
        });
        if (res.ok) setNotifications(await res.json());
      } catch { /* ignore */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [auth.token]);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id?: string) => {
    if (!auth.token) return;
    const body = id ? { id } : { markAllRead: true };
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify(body),
      });
      if (id) {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    if (auth.token) {
      try {
        await fetch("/api/admin/auth", {
          method: "DELETE",
          headers: { "x-auth-token": auth.token },
        });
      } catch { /* ignore */ }
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ user: null, token: null });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const visibleLinks = sidebarLinks.filter((link) => link.roles.includes(auth.user!.role));

  const initials = auth.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-gray-50 flex">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-accent" />
              <span className="font-heading text-lg font-bold">
                Haven<span className="text-accent">Admin</span>
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white" aria-label="Close sidebar">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {visibleLinks.map((link) => {
              const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-1">
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-accent">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{auth.user.name}</p>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${ROLE_COLORS[auth.user.role]}`}>
                    {ROLE_LABELS[auth.user.role]}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              Back to Website
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full">
              <Lock className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900" aria-label="Open sidebar">
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                <Link href="/admin" className="hover:text-primary">Admin</Link>
                {pathname !== "/admin" && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 capitalize">{pathname.split("/").pop()?.replace(/-/g, " ")}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen(!bellOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={() => markRead()} className="text-xs text-primary hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
                      )}
                      {notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/50" : ""}`}
                          onClick={() => {
                            if (!n.read) markRead(n.id);
                            if (n.link) { window.location.href = n.link; setBellOpen(false); }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !n.read ? "bg-blue-500" : "bg-transparent"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                              {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_COLORS[auth.user.role]}`}>
                {ROLE_LABELS[auth.user.role]}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{auth.user.name}</span>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
