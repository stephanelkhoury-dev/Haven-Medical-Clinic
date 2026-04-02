"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  treatment: string;
  text: string;
  rating: number;
}

function blank(): Testimonial {
  return { id: "", name: "", treatment: "", text: "", rating: 5 };
}

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) setItems(await res.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = async () => {
    if (!editing || !editing.name || !editing.text) { showToast("Name and review text required"); return; }
    try {
      if (isNew) {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setItems((p) => [...p, { ...editing, id: created.id }]);
        showToast("Testimonial added");
      } else {
        await fetch(`/api/admin/testimonials/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setItems((p) => p.map((t) => (t.id === editing.id ? editing : t)));
        showToast("Testimonial updated");
      }
    } catch { showToast("Failed to save"); }
    setEditing(null); setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      showToast("Testimonial removed");
    } catch { showToast("Failed to delete"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} patient reviews</p>
        </div>
        <button onClick={() => { setEditing(blank()); setIsNew(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-primary font-medium">{t.treatment}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <button onClick={() => { setEditing({ ...t }); setIsNew(false); }} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit">
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                {deleteConfirm === t.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(t.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No testimonials yet. Click &quot;Add Testimonial&quot; to get started.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Testimonial" : "Edit Testimonial"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Carla M." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Treatment</label>
                <input type="text" value={editing.treatment} onChange={(e) => setEditing({ ...editing, treatment: e.target.value })} placeholder="e.g. Botox & Fillers" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Review Text</label>
                <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={4} placeholder="Patient testimonial..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setEditing({ ...editing, rating: n })} className="p-1">
                      <Star className={`w-6 h-6 ${n <= editing.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
