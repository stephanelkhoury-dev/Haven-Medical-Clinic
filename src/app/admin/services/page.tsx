"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, Edit, Trash2, Eye, Search, X, Save,
  Upload, Image as ImageIcon, DollarSign, Clock, ChevronDown, Star, GripVertical,
} from "lucide-react";
import { serviceCategories } from "@/data/services";
const categories = ["all", "aesthetic", "surgical", "medical", "wellness"] as const;

type ServiceCategory = "aesthetic" | "surgical" | "medical" | "wellness";

interface AdminService {
  slug: string;
  title: string;
  shortDescription: string;
  category: ServiceCategory;
  iconName: string;
  heroImage: string;
  overview: string;
  whoIsItFor: string;
  benefits: string[];
  procedureSteps: string[];
  duration: string;
  recovery: string;
  expectedResults: string;
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
  price?: number;
  priceFrom?: boolean;
  priceNote?: string;
  featured?: boolean;
  subServices?: { name: string; description: string }[];
}

function createBlankService(): AdminService {
  return {
    slug: "",
    title: "",
    shortDescription: "",
    category: "aesthetic",
    iconName: "Sparkles",
    heroImage: "",
    overview: "",
    whoIsItFor: "",
    benefits: [""],
    procedureSteps: [""],
    duration: "",
    recovery: "",
    expectedResults: "",
    faqs: [{ question: "", answer: "" }],
    relatedSlugs: [],
    price: undefined,
    priceFrom: false,
    priceNote: "",
    featured: false,
    subServices: [],
  };
}

export default function AdminServices() {
  const [allServices, setAllServices] = useState<AdminService[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "pricing" | "media" | "seo">("basic");
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from API
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        setAllServices(await res.json());
      }
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = allServices.filter((s) => {
    const matchCat = filter === "all" || s.category === filter;
    const matchSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = () => {
    setEditing(createBlankService());
    setIsNew(true);
    setActiveTab("basic");
  };

  const handleEdit = (service: AdminService) => {
    setEditing({ ...service, benefits: [...service.benefits], procedureSteps: [...service.procedureSteps], faqs: service.faqs.map(f => ({ ...f })) });
    setIsNew(false);
    setActiveTab("basic");
  };

  const handleDelete = async (slug: string) => {
    try {
      await fetch(`/api/admin/services/${slug}`, { method: "DELETE" });
      setAllServices((prev) => prev.filter((s) => s.slug !== slug));
      setDeleteConfirm(null);
      showToast("Service deleted successfully");
    } catch {
      showToast("Failed to delete service");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    // Auto-generate slug
    if (!editing.slug && editing.title) {
      editing.slug = editing.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!editing.title || !editing.slug) {
      showToast("Title is required");
      return;
    }
    try {
      if (isNew) {
        // Check for duplicate slug
        if (allServices.some((s) => s.slug === editing.slug)) {
          showToast("A service with this URL slug already exists");
          return;
        }
        await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setAllServices((prev) => [...prev, editing]);
        showToast("Service created successfully");
      } else {
        await fetch(`/api/admin/services/${editing.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setAllServices((prev) =>
          prev.map((s) => (s.slug === editing.slug ? editing : s))
        );
        showToast("Service updated successfully");
      }
    } catch {
      showToast("Failed to save service");
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      showToast("Supported formats: JPG, PNG, WebP, SVG");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditing({ ...editing, heroImage: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const updateEditField = (field: string, value: unknown) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const updateBenefit = (idx: number, val: string) => {
    if (!editing) return;
    const arr = [...editing.benefits];
    arr[idx] = val;
    setEditing({ ...editing, benefits: arr });
  };

  const updateStep = (idx: number, val: string) => {
    if (!editing) return;
    const arr = [...editing.procedureSteps];
    arr[idx] = val;
    setEditing({ ...editing, procedureSteps: arr });
  };

  const updateFAQ = (idx: number, field: "question" | "answer", val: string) => {
    if (!editing) return;
    const arr = editing.faqs.map((f, i) => (i === idx ? { ...f, [field]: val } : f));
    setEditing({ ...editing, faqs: arr });
  };

  // ────── Editor Modal ──────
  if (editing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditing(null); setIsNew(false); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? "Add New Service" : `Edit: ${editing.title}`}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isNew ? "Fill in the details to create a new service" : `Editing /${editing.slug}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditing(null); setIsNew(false); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Save className="w-4 h-4" />
              {isNew ? "Create Service" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["basic", "details", "pricing", "media", "seo"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "seo" ? "SEO & URLs" : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Service Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => updateEditField("title", e.target.value)}
                    placeholder="e.g. Laser Hair Removal"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={editing.category}
                    onChange={(e) => updateEditField("category", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  >
                    {Object.entries(serviceCategories).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
                <textarea
                  value={editing.shortDescription}
                  onChange={(e) => updateEditField("shortDescription", e.target.value)}
                  rows={2}
                  placeholder="A brief sentence about this service..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Overview</label>
                <textarea
                  value={editing.overview}
                  onChange={(e) => updateEditField("overview", e.target.value)}
                  rows={4}
                  placeholder="Detailed description of the service..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Who Is It For?</label>
                <textarea
                  value={editing.whoIsItFor}
                  onChange={(e) => updateEditField("whoIsItFor", e.target.value)}
                  rows={2}
                  placeholder="Ideal for patients who..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <input
                  type="checkbox"
                  checked={editing.featured || false}
                  onChange={(e) => updateEditField("featured", e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                  id="featured"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                  <Star className="w-4 h-4 text-primary" />
                  Featured Service — show prominently on homepage
                </label>
              </div>
            </div>
          )}

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Clock className="w-4 h-4 inline mr-1" /> Duration
                  </label>
                  <input
                    type="text"
                    value={editing.duration}
                    onChange={(e) => updateEditField("duration", e.target.value)}
                    placeholder="e.g. 30-60 minutes"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Recovery</label>
                  <input
                    type="text"
                    value={editing.recovery}
                    onChange={(e) => updateEditField("recovery", e.target.value)}
                    placeholder="e.g. No downtime required"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Results</label>
                <textarea
                  value={editing.expectedResults}
                  onChange={(e) => updateEditField("expectedResults", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {/* Benefits */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Benefits</label>
                  <button
                    onClick={() => setEditing({ ...editing, benefits: [...editing.benefits, ""] })}
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    + Add Benefit
                  </button>
                </div>
                <div className="space-y-2">
                  {editing.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => updateBenefit(i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <button
                        onClick={() => setEditing({ ...editing, benefits: editing.benefits.filter((_, j) => j !== i) })}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Procedure Steps</label>
                  <button
                    onClick={() => setEditing({ ...editing, procedureSteps: [...editing.procedureSteps, ""] })}
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {editing.procedureSteps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => updateStep(i, e.target.value)}
                        placeholder={`Step ${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <button
                        onClick={() => setEditing({ ...editing, procedureSteps: editing.procedureSteps.filter((_, j) => j !== i) })}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">FAQs</label>
                  <button
                    onClick={() => setEditing({ ...editing, faqs: [...editing.faqs, { question: "", answer: "" }] })}
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-3">
                  {editing.faqs.map((f, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">FAQ #{i + 1}</span>
                        <button
                          onClick={() => setEditing({ ...editing, faqs: editing.faqs.filter((_, j) => j !== i) })}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={f.question}
                        onChange={(e) => updateFAQ(i, "question", e.target.value)}
                        placeholder="Question"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-2"
                      />
                      <textarea
                        value={f.answer}
                        onChange={(e) => updateFAQ(i, "answer", e.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING TAB ── */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-primary" /> Pricing Configuration
                </h3>
                <p className="text-sm text-gray-500">Set pricing for this service. Leave blank for &quot;Contact Us&quot; pricing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editing.price ?? ""}
                      onChange={(e) => updateEditField("price", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Note</label>
                  <input
                    type="text"
                    value={editing.priceNote || ""}
                    onChange={(e) => updateEditField("priceNote", e.target.value)}
                    placeholder="e.g. Per session, Per area, etc."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editing.priceFrom || false}
                  onChange={(e) => updateEditField("priceFrom", e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                  id="priceFrom"
                />
                <label htmlFor="priceFrom" className="text-sm text-gray-700 cursor-pointer">
                  Show as &quot;Starting from $X&quot; (variable pricing)
                </label>
              </div>

              {/* Price Preview */}
              <div className="p-5 bg-white border border-gray-200 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
                <div className="text-2xl font-bold text-gray-900">
                  {editing.price ? (
                    <>
                      {editing.priceFrom && <span className="text-sm font-normal text-gray-500 mr-1">From</span>}
                      ${editing.price}
                      {editing.priceNote && <span className="text-sm font-normal text-gray-500 ml-1.5">/ {editing.priceNote}</span>}
                    </>
                  ) : (
                    <span className="text-gray-400">Contact Us for Pricing</span>
                  )}
                </div>
              </div>

              {/* Sub-services pricing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Sub-Services / Add-ons</label>
                  <button
                    onClick={() => setEditing({ ...editing, subServices: [...(editing.subServices || []), { name: "", description: "" }] })}
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    + Add Sub-Service
                  </button>
                </div>
                <div className="space-y-2">
                  {(editing.subServices || []).map((sub, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => {
                            const arr = [...(editing.subServices || [])];
                            arr[i] = { ...arr[i], name: e.target.value };
                            setEditing({ ...editing, subServices: arr });
                          }}
                          placeholder="Sub-service name"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <input
                          type="text"
                          value={sub.description}
                          onChange={(e) => {
                            const arr = [...(editing.subServices || [])];
                            arr[i] = { ...arr[i], description: e.target.value };
                            setEditing({ ...editing, subServices: arr });
                          }}
                          placeholder="Description"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <button
                        onClick={() => setEditing({ ...editing, subServices: (editing.subServices || []).filter((_, j) => j !== i) })}
                        className="p-1.5 text-gray-400 hover:text-red-500 mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MEDIA TAB (Image Upload) ── */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Hero Image</label>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {editing.heroImage ? (
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editing.heroImage}
                        alt="Service hero"
                        className="max-h-64 mx-auto rounded-lg object-cover shadow-md"
                      />
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                        >
                          <Upload className="w-4 h-4" /> Replace Image
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateEditField("heroImage", ""); }}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Click to upload hero image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, or SVG — Max 5MB</p>
                        <p className="text-xs text-gray-400 mt-0.5">Recommended: 1200×600 pixels</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Images are stored as base64 in local storage for this demo. In production, images would upload to a cloud storage service (e.g., Cloudinary, AWS S3).
                </p>
              </div>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">/services/</span>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) => updateEditField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="auto-generated-from-title"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Only lowercase letters, numbers, and dashes</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Services</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editing.relatedSlugs.map((slug) => (
                    <span key={slug} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {slug}
                      <button onClick={() => setEditing({ ...editing, relatedSlugs: editing.relatedSlugs.filter(s => s !== slug) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !editing.relatedSlugs.includes(e.target.value)) {
                      setEditing({ ...editing, relatedSlugs: [...editing.relatedSlugs, e.target.value] });
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="">Select a related service...</option>
                  {allServices.filter(s => s.slug !== editing.slug && !editing.relatedSlugs.includes(s.slug)).map(s => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ────── List View ──────
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-dark text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-[fadeInUp_0.3s_ease-out]">
          {toast}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Service?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The service &quot;{allServices.find(s => s.slug === deleteConfirm)?.title}&quot; will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage {allServices.length} services — add, edit, delete, set pricing, and upload images.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat === "all" ? `All (${allServices.length})` : `${cat} (${allServices.filter(s => s.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div
            key={service.slug}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
          >
            {/* Image preview */}
            {service.heroImage && (
              <div className="h-32 bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.heroImage}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            {!service.heroImage && (
              <div className="h-32 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                  {service.category}
                </span>
                {service.featured && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {service.shortDescription}
              </p>

              {/* Price & Duration */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                {service.price ? (
                  <span className="font-semibold text-primary text-sm">
                    {service.priceFrom && "From "}${service.price}
                    {service.priceNote && <span className="font-normal text-gray-400 ml-0.5">/{service.priceNote}</span>}
                  </span>
                ) : (
                  <span className="text-gray-400">No price set</span>
                )}
                {service.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <a
                  href={`/services/${service.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  View
                </a>
                <button
                  onClick={() => setDeleteConfirm(service.slug)}
                  className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {allServices.length} services
      </p>
    </div>
  );
}
