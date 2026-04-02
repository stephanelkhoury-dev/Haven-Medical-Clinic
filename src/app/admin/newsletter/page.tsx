"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Clock,
  PenLine,
  Eye,
  Plus,
  BarChart3,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import { type NewsletterCampaign } from "@/data/admin";

function createBlankCampaign(): NewsletterCampaign {
  return {
    id: Date.now().toString(),
    subject: "",
    status: "draft",
    recipients: 0,
  };
}

export default function AdminNewsletter() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [editing, setEditing] = useState<NewsletterCampaign | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [content, setContent] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) setCampaigns(await res.json());
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setEditing(createBlankCampaign());
    setContent("");
    setIsNew(true);
  };

  const handleEdit = (campaign: NewsletterCampaign) => {
    setEditing(campaign);
    setContent("");
    setIsNew(false);
  };

  const handleSave = async (sendNow: boolean) => {
    if (!editing) return;
    if (!editing.subject.trim()) {
      showToast("Subject line is required.");
      return;
    }
    const now = new Date().toISOString().split("T")[0];
    const updated: NewsletterCampaign = sendNow
      ? { ...editing, status: "sent", sentAt: now, recipients: 245, openRate: 0, clickRate: 0 }
      : { ...editing };

    try {
      if (isNew) {
        const res = await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const created = await res.json();
        setCampaigns((prev) => [{ ...updated, id: created.id }, ...prev]);
        showToast(sendNow ? "Campaign sent!" : "Campaign saved as draft");
      } else {
        await fetch(`/api/admin/campaigns/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        showToast(sendNow ? "Campaign sent!" : "Campaign updated");
      }
    } catch {
      showToast("Failed to save campaign");
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleSchedule = async () => {
    if (!editing) return;
    if (!editing.subject.trim()) {
      showToast("Subject line is required.");
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const schedDate = tomorrow.toISOString().split("T")[0];
    const updated: NewsletterCampaign = { ...editing, status: "scheduled", scheduledAt: schedDate, recipients: 245 };

    try {
      if (isNew) {
        const res = await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const created = await res.json();
        setCampaigns((prev) => [{ ...updated, id: created.id }, ...prev]);
      } else {
        await fetch(`/api/admin/campaigns/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      }
      showToast(`Campaign scheduled for ${schedDate}`);
    } catch {
      showToast("Failed to schedule campaign");
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      showToast("Campaign deleted");
    } catch {
      showToast("Failed to delete campaign");
    }
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.recipients, 0);
  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const avgOpenRate = sentCampaigns.length
    ? (sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / sentCampaigns.length).toFixed(1)
    : "0.0";
  const avgClickRate = sentCampaigns.length
    ? (sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / sentCampaigns.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 bg-dark text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-90 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Campaign?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-start justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Create Campaign" : "Edit Campaign"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
                <input type="text" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="e.g. Spring Beauty Specials — Save 20%" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your newsletter content here..." rows={8} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as NewsletterCampaign["status"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-5 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700">Cancel</button>
              <button onClick={() => handleSave(false)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <PenLine className="w-4 h-4" />
                Save Draft
              </button>
              <button onClick={handleSchedule} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Clock className="w-4 h-4" />
                Schedule
              </button>
              <button onClick={() => handleSave(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Send className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage email campaigns for your subscribers.
          </p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: totalSent.toLocaleString(), icon: Send },
          { label: "Avg Open Rate", value: avgOpenRate + "%", icon: Eye },
          { label: "Avg Click Rate", value: avgClickRate + "%", icon: BarChart3 },
          { label: "Campaigns", value: campaigns.length, icon: PenLine },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Campaigns</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="px-5 py-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{campaign.subject}</h3>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    campaign.status === "sent" ? "bg-green-100 text-green-700"
                    : campaign.status === "scheduled" ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>{campaign.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {campaign.status === "sent"
                    ? `Sent on ${campaign.sentAt} to ${campaign.recipients.toLocaleString()} subscribers`
                    : campaign.status === "scheduled"
                    ? `Scheduled for ${campaign.scheduledAt}`
                    : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                {campaign.status === "sent" && (
                  <>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">{campaign.openRate}%</p>
                      <p className="text-xs text-gray-500">Opens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">{campaign.clickRate}%</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                  </>
                )}
                <button onClick={() => handleEdit(campaign)} className="p-2 text-gray-400 hover:text-primary">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(campaign.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="px-5 py-12 text-center text-gray-500">No campaigns yet. Create your first one!</div>
          )}
        </div>
      </div>
    </div>
  );
}
