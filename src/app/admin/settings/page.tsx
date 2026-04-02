"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Bell, Globe, Palette, Lock, Mail } from "lucide-react";
import { clinicInfo } from "@/data/clinic";

interface Settings {
  general: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    hours: string;
  };
  notifications: {
    newAppointments: boolean;
    newSubscribers: boolean;
    subscriptionChanges: boolean;
    weeklySummary: boolean;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
  };
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
}

function getDefaults(): Settings {
  return {
    general: {
      name: clinicInfo.name,
      tagline: clinicInfo.tagline,
      phone: clinicInfo.phone,
      email: clinicInfo.email,
      address: clinicInfo.address,
      whatsapp: clinicInfo.whatsapp,
      hours: clinicInfo.hours.weekdays,
    },
    notifications: {
      newAppointments: true,
      newSubscribers: true,
      subscriptionChanges: true,
      weeklySummary: true,
    },
    appearance: {
      primaryColor: "#1fbda6",
      accentColor: "#1fbda6",
    },
    emailSettings: {
      fromName: "Haven Medical",
      fromEmail: "havenmedicalcliniclb@gmail.com",
      replyTo: clinicInfo.email,
    },
  };
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings>(getDefaults());
  const [toast, setToast] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          general: data.general || getDefaults().general,
          notifications: data.notifications || getDefaults().notifications,
          appearance: data.appearance || getDefaults().appearance,
          emailSettings: data.email || getDefaults().emailSettings,
        });
      }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveSettings = async (updated: Settings) => {
    setSettings(updated);
    try {
      // Save each section as a separate settings key
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "general", value: updated.general }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "notifications", value: updated.notifications }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "appearance", value: updated.appearance }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "email", value: updated.emailSettings }),
        }),
      ]);
      showToast("Settings saved");
    } catch {
      showToast("Failed to save settings");
    }
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.");
      return;
    }
    // In demo mode, just confirm the action
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated");
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Lock },
  ];

  const g = settings.general;
  const n = settings.notifications;
  const a = settings.appearance;
  const e = settings.emailSettings;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 bg-dark text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

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
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <input type="text" value={g.name} onChange={(ev) => setSettings({ ...settings, general: { ...g, name: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input type="text" value={g.tagline} onChange={(ev) => setSettings({ ...settings, general: { ...g, tagline: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={g.phone} onChange={(ev) => setSettings({ ...settings, general: { ...g, phone: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={g.email} onChange={(ev) => setSettings({ ...settings, general: { ...g, email: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={g.address} onChange={(ev) => setSettings({ ...settings, general: { ...g, address: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input type="text" value={g.whatsapp} onChange={(ev) => setSettings({ ...settings, general: { ...g, whatsapp: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                  <input type="text" value={g.hours} onChange={(ev) => setSettings({ ...settings, general: { ...g, hours: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <button onClick={() => saveSettings(settings)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              {[
                { key: "newAppointments" as const, title: "New Appointment Requests", desc: "Receive alerts when a new appointment is requested." },
                { key: "newSubscribers" as const, title: "New Newsletter Subscribers", desc: "Notify when someone subscribes to the newsletter." },
                { key: "subscriptionChanges" as const, title: "Subscription Changes", desc: "Alerts for new, cancelled, or paused memberships." },
                { key: "weeklySummary" as const, title: "Weekly Summary Report", desc: "Receive a weekly summary of key metrics via email." },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n[item.key]}
                      onChange={(ev) => setSettings({ ...settings, notifications: { ...n, [item.key]: ev.target.checked } })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
              <button onClick={() => saveSettings(settings)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Save Notifications
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={a.primaryColor} onChange={(ev) => setSettings({ ...settings, appearance: { ...a, primaryColor: ev.target.value } })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input type="text" value={a.primaryColor} onChange={(ev) => setSettings({ ...settings, appearance: { ...a, primaryColor: ev.target.value } })} className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-32" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={a.accentColor} onChange={(ev) => setSettings({ ...settings, appearance: { ...a, accentColor: ev.target.value } })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input type="text" value={a.accentColor} onChange={(ev) => setSettings({ ...settings, appearance: { ...a, accentColor: ev.target.value } })} className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-32" />
                  </div>
                </div>
              </div>
              <button onClick={() => saveSettings(settings)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Save Appearance
              </button>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                  <input type="text" value={e.fromName} onChange={(ev) => setSettings({ ...settings, emailSettings: { ...e, fromName: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                  <input type="email" value={e.fromEmail} onChange={(ev) => setSettings({ ...settings, emailSettings: { ...e, fromEmail: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                  <input type="email" value={e.replyTo} onChange={(ev) => setSettings({ ...settings, emailSettings: { ...e, replyTo: ev.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <button onClick={() => saveSettings(settings)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Save Email Settings
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(ev) => setCurrentPassword(ev.target.value)} placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(ev) => setNewPassword(ev.target.value)} placeholder="Enter new password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(ev) => setConfirmPassword(ev.target.value)} placeholder="Confirm new password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <button onClick={handlePasswordUpdate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                <Lock className="w-4 h-4" /> Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
