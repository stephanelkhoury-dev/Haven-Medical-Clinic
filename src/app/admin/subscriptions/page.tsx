"use client";

import { useState } from "react";
import {
  CreditCard,
  Users,
  TrendingUp,
  Star,
  Eye,
  Edit,
  Search,
} from "lucide-react";
import {
  subscriptionPlans,
  mockMemberSubscriptions,
  type SubscriptionPlan,
  type MemberSubscription,
} from "@/data/admin";

export default function AdminSubscriptions() {
  const [view, setView] = useState<"plans" | "members">("members");
  const [search, setSearch] = useState("");

  const filteredMembers = mockMemberSubscriptions.filter(
    (m) =>
      search === "" ||
      m.memberName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberEmail.toLowerCase().includes(search.toLowerCase())
  );

  const activeMembers = mockMemberSubscriptions.filter(
    (m) => m.status === "active"
  ).length;
  const monthlyRevenue = mockMemberSubscriptions
    .filter((m) => m.status === "active")
    .reduce((sum, m) => {
      const plan = subscriptionPlans.find((p) => p.id === m.planId);
      return sum + (plan?.price || 0);
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage membership plans and subscriber accounts.
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("members")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "members"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setView("plans")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "plans"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Plans
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Members</p>
            <p className="text-xl font-bold text-gray-900">{activeMembers}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Monthly Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              ${monthlyRevenue.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Plans Available</p>
            <p className="text-xl font-bold text-gray-900">
              {subscriptionPlans.length}
            </p>
          </div>
        </div>
      </div>

      {view === "plans" ? (
        /* Plans View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border p-6 ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="inline-block text-xs font-medium bg-primary text-white px-2.5 py-0.5 rounded-full mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Plan
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Members View */
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
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
                      Since
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Billing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMembers.map((member) => {
                    const plan = subscriptionPlans.find(
                      (p) => p.id === member.planId
                    );
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {member.memberName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.memberEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {plan?.name || "Unknown"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              member.status === "active"
                                ? "bg-green-100 text-green-700"
                                : member.status === "paused"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {member.startDate}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {member.nextBilling}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
