"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Users,
  Star,
  Edit,
  Search,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import {
  type SubscriptionPlan,
  type MemberSubscription,
} from "@/data/admin";

function createBlankPlan(): SubscriptionPlan {
  return {
    id: Date.now().toString(),
    name: "",
    price: 0,
    interval: "monthly",
    description: "",
    features: [""],
  };
}

function createBlankMember(): MemberSubscription {
  return {
    id: Date.now().toString(),
    memberId: "m" + Date.now(),
    memberName: "",
    memberEmail: "",
    planId: "",
    planName: "",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    nextBilling: "",
    amount: 0,
  };
}

export default function AdminSubscriptions() {
  const [view, setView] = useState<"plans" | "members">("members");
  const [search, setSearch] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [members, setMembers] = useState<MemberSubscription[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingMember, setEditingMember] = useState<MemberSubscription | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "plan" | "member"; id: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [plansRes, membersRes] = await Promise.all([
        fetch("/api/admin/plans"),
        fetch("/api/admin/members"),
      ]);
      if (plansRes.ok) setPlans(await plansRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Plan CRUD
  const handleAddPlan = () => { setEditingPlan(createBlankPlan()); setIsNew(true); };
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    if (!editingPlan.name.trim()) { showToast("Plan name is required."); return; }
    const clean = { ...editingPlan, features: editingPlan.features.filter((f) => f.trim()) };
    try {
      if (isNew) {
        const res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clean),
        });
        const created = await res.json();
        setPlans((prev) => [...prev, { ...clean, id: created.id }]);
        showToast("Plan created");
      } else {
        await fetch(`/api/admin/plans/${clean.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clean),
        });
        setPlans((prev) => prev.map((p) => (p.id === clean.id ? clean : p)));
        showToast("Plan updated");
      }
    } catch {
      showToast("Failed to save plan");
    }
    setEditingPlan(null); setIsNew(false);
  };

  // Member CRUD
  const handleAddMember = () => { setEditingMember(createBlankMember()); setIsNew(true); };
  const handleSaveMember = async () => {
    if (!editingMember) return;
    if (!editingMember.memberName.trim() || !editingMember.memberEmail.trim()) { showToast("Name and email are required."); return; }
    const plan = plans.find((p) => p.id === editingMember.planId);
    const updated = { ...editingMember, planName: plan?.name || editingMember.planName, amount: plan?.price || editingMember.amount };
    try {
      if (isNew) {
        const res = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const created = await res.json();
        setMembers((prev) => [{ ...updated, id: created.id }, ...prev]);
        showToast("Member added");
      } else {
        await fetch(`/api/admin/members/${updated.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showToast("Member updated");
      }
    } catch {
      showToast("Failed to save member");
    }
    setEditingMember(null); setIsNew(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "plan") {
        await fetch(`/api/admin/plans/${deleteConfirm.id}`, { method: "DELETE" });
        setPlans((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        showToast("Plan deleted");
      } else {
        await fetch(`/api/admin/members/${deleteConfirm.id}`, { method: "DELETE" });
        setMembers((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
        showToast("Member removed");
      }
    } catch {
      showToast("Failed to delete");
    }
    setDeleteConfirm(null);
  };

  const filteredMembers = members.filter(
    (m) =>
      search === "" ||
      m.memberName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberEmail.toLowerCase().includes(search.toLowerCase())
  );

  const activeMembers = members.filter((m) => m.status === "active").length;
  const monthlyRevenue = members
    .filter((m) => m.status === "active")
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 bg-dark text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">{toast}</div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-90 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete {deleteConfirm.type === "plan" ? "Plan" : "Member"}?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan editor modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-start justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "New Plan" : "Edit Plan"}</h2>
              <button onClick={() => { setEditingPlan(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input type="text" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                  <select value={editingPlan.interval} onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value as SubscriptionPlan["interval"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="popular" checked={editingPlan.popular || false} onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })} className="rounded border-gray-300" />
                <label htmlFor="popular" className="text-sm font-medium text-gray-700">Mark as most popular</label>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button onClick={() => setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ""] })} className="text-xs text-primary hover:underline">+ Add Feature</button>
                </div>
                <div className="space-y-2">
                  {editingPlan.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={f} onChange={(e) => { const arr = [...editingPlan.features]; arr[i] = e.target.value; setEditingPlan({ ...editingPlan, features: arr }); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      <button onClick={() => setEditingPlan({ ...editingPlan, features: editingPlan.features.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setEditingPlan(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSavePlan} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">{isNew ? "Create Plan" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Member editor modal */}
      {editingMember && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Member" : "Edit Member"}</h2>
              <button onClick={() => { setEditingMember(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={editingMember.memberName} onChange={(e) => setEditingMember({ ...editingMember, memberName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={editingMember.memberEmail} onChange={(e) => setEditingMember({ ...editingMember, memberEmail: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select value={editingMember.planId} onChange={(e) => { const plan = plans.find((p) => p.id === e.target.value); setEditingMember({ ...editingMember, planId: e.target.value, planName: plan?.name || "", amount: plan?.price || 0 }); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="">Select a plan</option>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.price}/{p.interval})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingMember.status} onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as MemberSubscription["status"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={editingMember.startDate} onChange={(e) => setEditingMember({ ...editingMember, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Billing</label>
                  <input type="date" value={editingMember.nextBilling} onChange={(e) => setEditingMember({ ...editingMember, nextBilling: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setEditingMember(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveMember} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">{isNew ? "Add Member" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage membership plans and subscriber accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view === "plans" ? (
            <button onClick={handleAddPlan} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus className="w-4 h-4" /> New Plan
            </button>
          ) : (
            <button onClick={handleAddMember} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView("members")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "members" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Members</button>
            <button onClick={() => setView("plans")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "plans" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Plans</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Active Members</p>
            <p className="text-xl font-bold text-gray-900">{activeMembers}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-gray-500">Monthly Revenue</p>
            <p className="text-xl font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Star className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Plans Available</p>
            <p className="text-xl font-bold text-gray-900">{plans.length}</p>
          </div>
        </div>
      </div>

      {view === "plans" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl border p-6 ${plan.popular ? "border-primary ring-2 ring-primary/20" : "border-gray-200"}`}>
              {plan.popular && <span className="inline-block text-xs font-medium bg-primary text-white px-2.5 py-0.5 rounded-full mb-3">Most Popular</span>}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500">/{plan.interval}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>{feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2">
                <button onClick={() => { setEditingPlan(plan); setIsNew(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setDeleteConfirm({ type: "plan", id: plan.id })} className="px-3 py-2.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">No plans yet. Create your first one!</div>
          )}
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Since</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMembers.map((member) => {
                    const plan = plans.find((p) => p.id === member.planId);
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{member.memberName}</p>
                          <p className="text-xs text-gray-500">{member.memberEmail}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{plan?.name || member.planName || "Unknown"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                            member.status === "active" ? "bg-green-100 text-green-700"
                            : member.status === "paused" ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                          }`}>{member.status}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{member.startDate}</td>
                        <td className="px-5 py-4 text-gray-600">{member.nextBilling}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditingMember(member); setIsNew(false); }} className="px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Edit</button>
                            <button onClick={() => setDeleteConfirm({ type: "member", id: member.id })} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
