"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, GripVertical } from "lucide-react";
import Image from "next/image";

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  sortOrder: number;
}

function blank(): Doctor {
  return { id: "", name: "", title: "", specialty: "", image: "", bio: "", sortOrder: 0 };
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/doctors");
      if (res.ok) setDoctors(await res.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = async () => {
    if (!editing || !editing.name) { showToast("Name is required"); return; }
    try {
      if (isNew) {
        const res = await fetch("/api/admin/doctors", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setDoctors((p) => [...p, { ...editing, id: created.id }]);
        showToast("Doctor added");
      } else {
        await fetch(`/api/admin/doctors/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setDoctors((p) => p.map((d) => (d.id === editing.id ? editing : d)));
        showToast("Doctor updated");
      }
    } catch { showToast("Failed to save"); }
    setEditing(null); setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
      setDoctors((p) => p.filter((d) => d.id !== id));
      setDeleteConfirm(null);
      showToast("Doctor removed");
    } catch { showToast("Failed to delete"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-white px-4 py-2 rounded-lg text-sm shadow-lg">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors &amp; Specialists</h1>
          <p className="text-sm text-gray-500 mt-1">{doctors.length} team members</p>
        </div>
        <button onClick={() => { setEditing(blank()); setIsNew(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {doctors.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
              {doc.image ? (
                <Image src={doc.image} alt={doc.name} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                  {doc.name.split(" ").map(n => n[0]).join("")}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
              <p className="text-xs text-primary font-medium">{doc.title}</p>
              <p className="text-xs text-gray-500">{doc.specialty}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing({ ...doc }); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              {deleteConfirm === doc.id ? (
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(doc.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(doc.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No doctors added yet. Click &quot;Add Doctor&quot; to get started.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Doctor" : "Edit Doctor"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name", key: "name", placeholder: "Dr. John Doe" },
                { label: "Title / Role", key: "title", placeholder: "Medical Director" },
                { label: "Specialty", key: "specialty", placeholder: "Plastic & Reconstructive Surgery" },
                { label: "Image URL", key: "image", placeholder: "/images/doctors/photo.webp" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(editing as unknown as Record<string, string>)[key] || ""}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                <textarea
                  value={editing.bio}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Brief biography..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
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
