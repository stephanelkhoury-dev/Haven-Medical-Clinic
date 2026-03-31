"use client";

import { useState } from "react";
import {
  Send,
  Clock,
  CheckCircle,
  PenLine,
  Eye,
  Plus,
  BarChart3,
} from "lucide-react";
import { mockCampaigns, type NewsletterCampaign } from "@/data/admin";

export default function AdminNewsletter() {
  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage email campaigns for your subscribers.
          </p>
        </div>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaign Composer */}
      {showComposer && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Campaign
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Spring Beauty Specials — Save 20%"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here..."
              rows={8}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Send className="w-4 h-4" />
              Send Now
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <Clock className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => setShowComposer(false)}
              className="px-5 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sent",
            value: mockCampaigns
              .reduce((sum, c) => sum + c.recipients, 0)
              .toLocaleString(),
            icon: Send,
          },
          {
            label: "Avg Open Rate",
            value:
              (
                mockCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) /
                mockCampaigns.length
              ).toFixed(1) + "%",
            icon: Eye,
          },
          {
            label: "Avg Click Rate",
            value:
              (
                mockCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
                mockCampaigns.length
              ).toFixed(1) + "%",
            icon: BarChart3,
          },
          {
            label: "Campaigns",
            value: mockCampaigns.length,
            icon: PenLine,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
          >
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
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="px-5 py-4 hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    {campaign.subject}
                  </h3>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      campaign.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : campaign.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {campaign.status}
                  </span>
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
                      <p className="text-gray-900 font-medium">
                        {campaign.openRate}%
                      </p>
                      <p className="text-xs text-gray-500">Opens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">
                        {campaign.clickRate}%
                      </p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                  </>
                )}
                <button className="p-2 text-gray-400 hover:text-primary">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
