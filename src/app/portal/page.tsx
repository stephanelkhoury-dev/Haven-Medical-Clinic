"use client";

import { useState, useEffect } from "react";
import { useClientAuth } from "./layout";
import { Calendar, Clock, Loader2, CheckCircle2, XCircle, AlertCircle, CircleDot } from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  createdAt: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  confirmed: { icon: CircleDot, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Confirmed" },
  completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Cancelled" },
};

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
}

export default function PortalPage() {
  const { client, token } = useClientAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/portal/appointments", {
          headers: { "x-client-token": token },
        });
        if (res.ok) setAppointments(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [token]);

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  const upcoming = appointments.filter((a) => a.status === "confirmed" && new Date(a.date) >= new Date());
  const past = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {client?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}`
            : "No upcoming appointments"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
          <p className="text-gray-500 text-xs mt-1">Upcoming</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{past.length}</p>
          <p className="text-gray-500 text-xs mt-1">Completed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{appointments.filter((a) => a.status === "pending").length}</p>
          <p className="text-gray-500 text-xs mt-1">Pending</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "confirmed", "pending", "completed", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary/50"}`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const cfg = statusConfig[apt.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={apt.id} className={`border rounded-xl p-4 sm:p-5 ${cfg.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${cfg.color} shrink-0`} />
                      <span className={`text-xs font-medium uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base">{apt.service}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(apt.date)}
                      </span>
                      {apt.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {apt.time}
                        </span>
                      )}
                    </div>
                    {apt.notes && (
                      <p className="text-gray-500 text-sm mt-2 italic">{apt.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
