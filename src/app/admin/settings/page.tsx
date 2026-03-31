"use client";

import { useState } from "react";
import { Save, Bell, Globe, Palette, Lock, Mail } from "lucide-react";
import { clinicInfo } from "@/data/clinic";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage clinic settings and configurations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex lg:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                General Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.name}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.tagline}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.phone}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={clinicInfo.email}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.address}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.whatsapp}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    defaultValue={clinicInfo.hours.weekdays}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              {[
                {
                  title: "New Appointment Requests",
                  desc: "Receive alerts when a new appointment is requested.",
                },
                {
                  title: "New Newsletter Subscribers",
                  desc: "Notify when someone subscribes to the newsletter.",
                },
                {
                  title: "Subscription Changes",
                  desc: "Alerts for new, cancelled, or paused memberships.",
                },
                {
                  title: "Weekly Summary Report",
                  desc: "Receive a weekly summary of key metrics via email.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Appearance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      defaultValue="#1fbda6"
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#1fbda6"
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-32"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      defaultValue="#1fbda6"
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#1fbda6"
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-32"
                    />
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" />
                Save Appearance
              </button>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Haven Medical"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    defaultValue="newsletter@havenmedical.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    defaultValue={clinicInfo.email}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" />
                Save Email Settings
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
