"use client";

import { useState, useEffect, createContext, useContext, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Calendar, LogOut, Lock, Eye, EyeOff, User, Menu, X } from "lucide-react";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClientAuth {
  client: ClientUser | null;
  token: string | null;
}

const ClientAuthContext = createContext<ClientAuth>({ client: null, token: null });
export function useClientAuth() { return useContext(ClientAuthContext); }

const CLIENT_STORAGE_KEY = "haven_client_auth";

function PortalLogin({ onLogin }: { onLogin: (client: ClientUser, token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (forgotMode) {
      try {
        const res = await fetch("/api/portal/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setForgotSent(true);
        } else {
          const data = await res.json();
          setError(data.error || "Failed to send reset email");
        }
      } catch {
        setError("Unable to connect. Please try again.");
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify({
        token: data.token,
        client: data.client,
      }));

      onLogin(data.client, data.token);
    } catch {
      setError("Unable to connect. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900">
            Patient Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {forgotMode ? "Reset your password" : "Sign in to view your appointments"}
          </p>
        </div>

        {forgotSent ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-gray-900 font-semibold">Check Your Email</h2>
            <p className="text-gray-500 text-sm">If an account exists with that email, you&apos;ll receive a password reset link shortly.</p>
            <button onClick={() => { setForgotMode(false); setForgotSent(false); }}
              className="text-primary text-sm font-medium hover:underline">← Back to login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" required autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>

            {!forgotMode && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" required autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Lock className="w-4 h-4" />
              {loading ? "Please wait..." : forgotMode ? "Send Reset Link" : "Sign In"}
            </button>

            <div className="text-center">
              <button type="button" onClick={() => { setForgotMode(!forgotMode); setError(""); }}
                className="text-primary text-xs font-medium hover:underline">
                {forgotMode ? "← Back to login" : "Forgot your password?"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Haven Medical Clinic
        </p>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<ClientAuth>({ client: null, token: null });
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!stored) { setChecking(false); return; }

    try {
      const parsed = JSON.parse(stored);
      fetch("/api/portal/auth", {
        headers: { "x-client-token": parsed.token },
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAuth({ client: data.client, token: parsed.token });
        } else {
          localStorage.removeItem(CLIENT_STORAGE_KEY);
        }
        setChecking(false);
      }).catch(() => {
        setChecking(false);
      });
    } catch {
      localStorage.removeItem(CLIENT_STORAGE_KEY);
      setChecking(false);
    }
  }, []);

  const handleLogin = (client: ClientUser, token: string) => {
    setAuth({ client, token });
  };

  const handleLogout = async () => {
    if (auth.token) {
      try {
        await fetch("/api/portal/auth", {
          method: "DELETE",
          headers: { "x-client-token": auth.token },
        });
      } catch { /* ignore */ }
    }
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    setAuth({ client: null, token: null });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.client) {
    return <PortalLogin onLogin={handleLogin} />;
  }

  const initials = auth.client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ClientAuthContext.Provider value={auth}>
      <div className="min-h-screen bg-gray-50">
        {/* Top Nav */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/portal" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-gray-900">
                Haven<span className="text-primary">Portal</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden sm:flex items-center gap-4">
              <Link href="/portal" 
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname === "/portal" ? "bg-primary/10 text-primary" : "text-gray-600 hover:text-gray-900"}`}>
                <Calendar className="w-4 h-4" /> Appointments
              </Link>
              <div className="flex items-center gap-2 ml-2 border-l border-gray-200 pl-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{initials}</span>
                </div>
                <span className="text-sm text-gray-700">{auth.client.name}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-1" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden text-gray-600">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="sm:hidden border-t border-gray-100 px-4 py-3 space-y-2 bg-white">
              <Link href="/portal" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                <Calendar className="w-4 h-4" /> Appointments
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 mt-2 pt-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 flex-1">{auth.client.name}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Sign out</button>
              </div>
            </div>
          )}
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </ClientAuthContext.Provider>
  );
}
