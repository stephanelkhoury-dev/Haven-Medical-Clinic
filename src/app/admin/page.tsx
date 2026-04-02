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
} from "lucide-react";
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<AppointmentRequest[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<NewsletterCampaign[]>([]);
  const [memberSubs, setMemberSubs] = useState<MemberSubscription[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, aptsRes, campaignsRes, membersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/appointments"),
        fetch("/api/admin/campaigns"),
        fetch("/api/admin/members"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (aptsRes.ok) {
        const apts = await aptsRes.json();
        setRecentAppointments(apts.slice(0, 5));
      }
      if (campaignsRes.ok) {
        const camps = await campaignsRes.json();
        setRecentCampaigns(camps.slice(0, 3));
      }
      if (membersRes.ok) setMemberSubs(await membersRes.json());
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const monthlyRevenue = memberSubs
    .filter((m) => m.status === "active")
    .reduce((sum, m) => sum + m.amount, 0);

  const statCards = [
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back. Here is an overview of Haven Medical.
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
              <div
                className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}
              >
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Recent Appointments
            </h2>
            <Link
              href="/admin/appointments"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {apt.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {apt.name}
                    </p>
                    <p className="text-xs text-gray-500">{apt.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {apt.date} · {apt.time}
                  </p>
                  <span
                    className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : apt.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Campaigns */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                {
                  label: "New Newsletter Campaign",
                  href: "/admin/newsletter",
                  icon: Mail,
                },
                {
                  label: "View Subscribers",
                  href: "/admin/subscribers",
                  icon: Users,
                },
                {
                  label: "Manage Services",
                  href: "/admin/services",
                  icon: Stethoscope,
                },
                {
                  label: "Write Blog Post",
                  href: "/admin/blog",
                  icon: FileText,
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <action.icon className="w-4 h-4 text-primary" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent campaigns */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Newsletter Campaigns
              </h2>
              <Link
                href="/admin/newsletter"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {campaign.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        campaign.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {campaign.status}
                    </span>
                    {campaign.openRate && (
                      <span className="text-xs text-gray-500">
                        {campaign.openRate}% opened
                      </span>
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
          <h2 className="font-semibold text-gray-900">
            Active Subscriptions
          </h2>
          <Link
            href="/admin/subscriptions"
            className="text-xs text-primary hover:underline"
          >
            Manage
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {memberSubs.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {sub.memberName}
                    </p>
                    <p className="text-xs text-gray-500">{sub.memberEmail}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-700">
                      {sub.planName}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "paused"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {sub.nextBilling}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">
                    ${sub.amount}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
