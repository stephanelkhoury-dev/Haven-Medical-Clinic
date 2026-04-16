"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../layout";
import { useRouter } from "next/navigation";
import {
  ScrollText,
  Search,
  Filter,
  User,
  Calendar,
  FileText,
  CreditCard,
  Stethoscope,
  Mail,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

const ENTITY_ICONS: Record<string, typeof ScrollText> = {
  appointment: Calendar,
  client: UserPlus,
  blog: FileText,
  service: Stethoscope,
  subscriber: Mail,
  expense: CreditCard,
  entry: CreditCard,
  product: CreditCard,
  user: User,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  finance: "bg-green-100 text-green-700",
  editor: "bg-blue-100 text-blue-700",
  front_desk: "bg-amber-100 text-amber-700",
};

const ACTION_COLORS: Record<string, string> = {
  created: "text-green-600",
  updated: "text-blue-600",
  deleted: "text-red-600",
  sent_reminder: "text-purple-600",
  confirmed: "text-green-600",
  cancelled: "text-red-600",
};

export default function ActivityLogsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Guard: admin only
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("offset", String(page * pageSize));
      if (entityFilter) params.set("entity_type", entityFilter);

      const res = await fetch(`/api/admin/logs?${params.toString()}`, {
        headers: { "x-auth-token": token },
      });
      if (res.ok) setLogs(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, page, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = searchQuery
    ? logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all admin actions across the system</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, action, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
          >
            <option value="">All types</option>
            <option value="appointment">Appointments</option>
            <option value="client">Clients</option>
            <option value="blog">Blog</option>
            <option value="service">Services</option>
            <option value="subscriber">Subscribers</option>
            <option value="expense">Expenses</option>
            <option value="entry">Entries</option>
            <option value="product">Products</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ScrollText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => {
              const Icon = ENTITY_ICONS[log.entityType] || ScrollText;
              const actionColor = Object.entries(ACTION_COLORS).find(([key]) =>
                log.action.toLowerCase().includes(key)
              )?.[1] || "text-gray-600";

              return (
                <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${ROLE_COLORS[log.userRole] || "bg-gray-100 text-gray-600"}`}>
                        {log.userRole.replace("_", " ")}
                      </span>
                      <span className={`text-sm font-medium ${actionColor}`}>
                        {formatAction(log.action)}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {log.entityType}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{log.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {page * pageSize + 1}–{page * pageSize + filteredLogs.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 min-w-15 text-center">Page {page + 1}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={logs.length < pageSize}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
