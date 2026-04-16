"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  Mail,
  FileText,
  ArrowUpRight,
  Clock,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  Phone,
  UserPlus,
  Calculator,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "./layout";
import type { AppointmentRequest, NewsletterCampaign, MemberSubscription } from "@/data/admin";

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  totalSubscribers: number;
  activeMembers: number;
  totalServices: number;
  totalBlogPosts: number;
  totalCampaigns: number;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const isFrontDesk = user?.role === "front_desk";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentRequest[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentRequest[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<NewsletterCampaign[]>([]);
  const [memberSubs, setMemberSubs] = useState<MemberSubscription[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reminderSending, setReminderSending] = useState<string | null>(null);
  const [reminderResult, setReminderResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const fetches: Promise<Response>[] = [
        fetch("/api/admin/stats"),
        fetch("/api/admin/appointments"),
      ];
      if (!isFrontDesk) {
        fetches.push(fetch("/api/admin/campaigns"), fetch("/api/admin/members"));
      }
      const responses = await Promise.all(fetches);
      const [statsRes, aptsRes] = responses;
      if (statsRes.ok) setStats(await statsRes.json());
      if (aptsRes.ok) {
        const apts = await aptsRes.json();
        setAllAppointments(apts);
        setRecentAppointments(apts.slice(0, 5));
      }
      if (!isFrontDesk && responses[2]?.ok) {
        const camps = await responses[2].json();
        setRecentCampaigns(camps.slice(0, 3));
      }
      if (!isFrontDesk && responses[3]?.ok) setMemberSubs(await responses[3].json());
    } catch { /* API unavailable */ }
  }, [isFrontDesk]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Calendar helpers ──────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Map appointments by date
  const aptsByDate: Record<string, AppointmentRequest[]> = {};
  allAppointments.forEach((apt) => {
    if (!apt.date) return;
    if (!aptsByDate[apt.date]) aptsByDate[apt.date] = [];
    aptsByDate[apt.date].push(apt);
  });

  const selectedApts = selectedDate ? (aptsByDate[selectedDate] || []) : [];

  const todaysAppointments = allAppointments.filter((a) => a.date === todayStr);
  const pendingCount = allAppointments.filter((a) => a.status === "pending").length;
  const confirmedToday = todaysAppointments.filter((a) => a.status === "confirmed").length;

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  // ── Send reminder ─────────────────────────────────────────────────
  const sendReminder = async (aptId: string, method: "email" | "whatsapp" | "both") => {
    if (!token) return;
    setReminderSending(aptId);
    setReminderResult(null);
    try {
      const res = await fetch("/api/admin/appointments/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ appointmentId: aptId, method }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.whatsapp) window.open(data.whatsapp, "_blank");
        setReminderResult({ id: aptId, ok: true, msg: method === "whatsapp" ? "WhatsApp opened" : "Reminder sent!" });
      } else {
        setReminderResult({ id: aptId, ok: false, msg: data.error || "Failed" });
      }
    } catch {
      setReminderResult({ id: aptId, ok: false, msg: "Network error" });
    }
    setReminderSending(null);
    setTimeout(() => setReminderResult(null), 3000);
  };

  // ── Front Desk stat cards ─────────────────────────────────────────
  const frontDeskCards = [
    {
      label: "Today's Appointments",
      value: todaysAppointments.length,
      sub: `${confirmedToday} confirmed`,
      icon: Calendar,
      color: "bg-blue-500",
      href: "/admin/appointments",
    },
    {
      label: "Pending Appointments",
      value: pendingCount,
      sub: "Awaiting confirmation",
      icon: Clock,
      color: "bg-amber-500",
      href: "/admin/appointments",
    },
    {
      label: "Total Appointments",
      value: stats?.totalAppointments ?? 0,
      sub: "All time",
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/admin/appointments",
    },
    {
      label: "Subscribers",
      value: stats?.totalSubscribers ?? 0,
      sub: "Newsletter",
      icon: Users,
      color: "bg-purple-500",
      href: "/admin/subscribers",
    },
  ];

  // ── Admin stat cards ──────────────────────────────────────────────
  const monthlyRevenue = memberSubs
    .filter((m) => m.status === "active")
    .reduce((sum, m) => sum + m.amount, 0);

  const adminCards = [
    {
      label: "Total Appointments",
      value: stats?.totalAppointments ?? 0,
      sub: `${stats?.pendingAppointments ?? 0} pending`,
      icon: Calendar,
      color: "bg-blue-500",
      href: "/admin/appointments",
    },
    {
      label: "Newsletter Subscribers",
      value: stats?.totalSubscribers ?? 0,
      sub: "Active subscribers",
      icon: Mail,
      color: "bg-green-500",
      href: "/admin/subscribers",
    },
    {
      label: "Active Members",
      value: stats?.activeMembers ?? 0,
      sub: "Subscription plans",
      icon: CreditCard,
      color: "bg-purple-500",
      href: "/admin/subscriptions",
    },
    {
      label: "Monthly Revenue",
      value: `$${monthlyRevenue.toLocaleString()}`,
      sub: "From subscriptions",
      icon: TrendingUp,
      color: "bg-amber-500",
      href: "/admin/subscriptions",
    },
  ];

  const statCards = isFrontDesk ? frontDeskCards : adminCards;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isFrontDesk ? "Front Desk Dashboard" : "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isFrontDesk
            ? `Welcome back, ${user?.name}. Manage appointments & clients.`
            : "Welcome back. Here is an overview of Haven Medical."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            <p className="text-xs text-green-600 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Front Desk: Calendar + Appointments ──────────────────── */}
      {isFrontDesk && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Appointment Calendar</h2>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-35 text-center">{monthLabel}</span>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const hasApts = aptsByDate[dateStr]?.length > 0;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                          ${isSelected ? "bg-primary text-white" : isToday ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-50 text-gray-700"}
                        `}
                      >
                        {day}
                        {hasApts && (
                          <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Date Appointments / Today */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {selectedDate
                    ? `Appointments — ${new Date(selectedDate + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
                    : "Today's Appointments"}
                </h2>
                <Link href="/admin/appointments" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50 max-h-100 overflow-y-auto">
                {(selectedDate ? selectedApts : todaysAppointments).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No appointments {selectedDate ? "on this date" : "today"}</p>
                  </div>
                )}
                {(selectedDate ? selectedApts : todaysAppointments).map((apt) => (
                  <div key={apt.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {apt.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{apt.name}</p>
                        <p className="text-xs text-gray-500">{apt.service} · {apt.time || "No time set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        apt.status === "confirmed" ? "bg-green-100 text-green-700"
                        : apt.status === "pending" ? "bg-amber-100 text-amber-700"
                        : apt.status === "completed" ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                      }`}>{apt.status}</span>
                      {/* Reminder buttons */}
                      {(apt.status === "confirmed" || apt.status === "pending") && (
                        <div className="flex items-center gap-1 ml-2">
                          {apt.email && (
                            <button
                              onClick={() => sendReminder(apt.id, "email")}
                              disabled={reminderSending === apt.id}
                              title="Send email reminder"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => sendReminder(apt.id, "whatsapp")}
                            disabled={reminderSending === apt.id}
                            title="Send WhatsApp reminder"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {reminderResult?.id === apt.id && (
                        <span className={`text-xs ${reminderResult.ok ? "text-green-600" : "text-red-500"}`}>
                          {reminderResult.msg}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Front Desk Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "New Appointment", href: "/admin/appointments", icon: Calendar, color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Manage Clients", href: "/admin/clients", icon: UserPlus, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Accounting", href: "/admin/accounting", icon: Calculator, color: "bg-purple-50 text-purple-700 border-purple-200" },
              { label: "Subscribers", href: "/admin/subscribers", icon: Users, color: "bg-amber-50 text-amber-700 border-amber-200" },
            ].map((a) => (
              <Link key={a.label} href={a.href}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${a.color} hover:shadow-sm transition-shadow`}>
                <a.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Recent appointments (all) */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
              <Link href="/admin/appointments" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {apt.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.name}</p>
                      <p className="text-xs text-gray-500">{apt.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{apt.date} · {apt.time}</p>
                    <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      apt.status === "confirmed" ? "bg-green-100 text-green-700"
                      : apt.status === "pending" ? "bg-amber-100 text-amber-700"
                      : apt.status === "completed" ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                    }`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Admin/Other Roles Dashboard ──────────────────────────── */}
      {!isFrontDesk && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Appointments */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
                <Link href="/admin/appointments" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAppointments.map((apt) => (
                  <div key={apt.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {apt.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{apt.name}</p>
                        <p className="text-xs text-gray-500">{apt.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{apt.date} · {apt.time}</p>
                      <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        apt.status === "confirmed" ? "bg-green-100 text-green-700"
                        : apt.status === "pending" ? "bg-amber-100 text-amber-700"
                        : apt.status === "completed" ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                      }`}>{apt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Recent Campaigns */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: "New Newsletter Campaign", href: "/admin/newsletter", icon: Mail },
                    { label: "View Subscribers", href: "/admin/subscribers", icon: Users },
                    { label: "Manage Services", href: "/admin/services", icon: Stethoscope },
                    { label: "Write Blog Post", href: "/admin/blog", icon: FileText },
                  ].map((action) => (
                    <Link key={action.label} href={action.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <action.icon className="w-4 h-4 text-primary" />
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Newsletter Campaigns</h2>
                  <Link href="/admin/newsletter" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{campaign.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          campaign.status === "sent" ? "bg-green-100 text-green-700"
                          : campaign.status === "scheduled" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{campaign.status}</span>
                        {campaign.openRate && (
                          <span className="text-xs text-gray-500">{campaign.openRate}% opened</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active subscriptions overview */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Active Subscriptions</h2>
              <Link href="/admin/subscriptions" className="text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {memberSubs.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{sub.memberName}</p>
                        <p className="text-xs text-gray-500">{sub.memberEmail}</p>
                      </td>
                      <td className="px-5 py-3"><span className="text-sm text-gray-700">{sub.planName}</span></td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          sub.status === "active" ? "bg-green-100 text-green-700"
                          : sub.status === "paused" ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                        }`}>{sub.status}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{sub.nextBilling}</td>
                      <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">${sub.amount}/mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
