"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, GripVertical, Upload, Loader2, GraduationCap, Award } from "lucide-react";
import Image from "next/image";

interface Education { degree: string; institution: string; year: string; }
interface Certification { title: string; issuer: string; }
interface SocialLinks { instagram?: string; facebook?: string; linkedin?: string; }

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  sortOrder: number;
  slug: string;
  fullBio: string;
  education: Education[];
  languages: string;
  experienceYears: number;
  certifications: Certification[];
  gallery: string[];
  socialLinks: SocialLinks;
}

function blank(): Doctor {
  return { id: "", name: "", title: "", specialty: "", image: "", bio: "", sortOrder: 0, slug: "", fullBio: "", education: [], languages: "", experienceYears: 0, certifications: [], gallery: [], socialLinks: {} };
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "bio" | "credentials" | "gallery" | "social">("basic");

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
        setDoctors((p) => [...p, { ...editing, id: created.id, slug: created.slug }]);
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
    setEditing(null); setIsNew(false); setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
      setDoctors((p) => p.filter((d) => d.id !== id));
      setDeleteConfirm(null);
      showToast("Doctor removed");
    } catch { showToast("Failed to delete"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "profile" | "gallery" = "profile") => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (target === "profile") setUploading(true); else setUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "doctors");
      fd.append("alt", editing.name || file.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const { url } = await res.json();
      if (target === "profile") setEditing({ ...editing, image: url });
      else setEditing({ ...editing, gallery: [...editing.gallery, url] });
      showToast("Image uploaded");
    } catch (err) { showToast(err instanceof Error ? err.message : "Upload failed"); }
    if (target === "profile") setUploading(false); else setUploadingGallery(false);
  };

  const removeGalleryImage = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: editing.gallery.filter((_, i) => i !== index) });
  };

  const addEducation = () => { if (!editing) return; setEditing({ ...editing, education: [...editing.education, { degree: "", institution: "", year: "" }] }); };
  const updateEducation = (i: number, f: keyof Education, v: string) => { if (!editing) return; const e = [...editing.education]; e[i] = { ...e[i], [f]: v }; setEditing({ ...editing, education: e }); };
  const removeEducation = (i: number) => { if (!editing) return; setEditing({ ...editing, education: editing.education.filter((_, idx) => idx !== i) }); };

  const addCertification = () => { if (!editing) return; setEditing({ ...editing, certifications: [...editing.certifications, { title: "", issuer: "" }] }); };
  const updateCertification = (i: number, f: keyof Certification, v: string) => { if (!editing) return; const c = [...editing.certifications]; c[i] = { ...c[i], [f]: v }; setEditing({ ...editing, certifications: c }); };
  const removeCertification = (i: number) => { if (!editing) return; setEditing({ ...editing, certifications: editing.certifications.filter((_, idx) => idx !== i) }); };

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
        <button onClick={() => { setEditing(blank()); setIsNew(true); setActiveTab("basic"); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
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
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 shrink-0">
              {doc.slug && <span className="bg-gray-100 px-2 py-0.5 rounded">/{doc.slug}</span>}
              {doc.education?.length > 0 && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{doc.education.length}</span>}
              {doc.certifications?.length > 0 && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{doc.certifications.length}</span>}
              {doc.gallery?.length > 0 && <span>{doc.gallery.length} photos</span>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing({ ...doc }); setIsNew(false); setActiveTab("basic"); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Add Doctor" : "Edit Doctor"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); setActiveTab("basic"); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6 gap-1 overflow-x-auto">
              {([
                { key: "basic" as const, label: "Basic Info" },
                { key: "bio" as const, label: "Biography" },
                { key: "credentials" as const, label: "Credentials" },
                { key: "gallery" as const, label: "Gallery" },
                { key: "social" as const, label: "Social" },
              ]).map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <>
                  {[
                    { label: "Full Name", key: "name", placeholder: "Dr. John Doe" },
                    { label: "Title / Role", key: "title", placeholder: "Medical Director" },
                    { label: "Specialty", key: "specialty", placeholder: "Plastic & Reconstructive Surgery" },
                    { label: "URL Slug", key: "slug", placeholder: "dr-john-doe (auto-generated if empty)" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input type="text" value={(editing as unknown as Record<string, string>)[key] || ""} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  ))}

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Profile Photo</label>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                        {editing.image ? (<Image src={editing.image} alt="Preview" fill className="object-cover" sizes="96px" />) : (<div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                          {uploading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>) : (<><Upload className="w-4 h-4" /> Choose File</>)}
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleImageUpload(e, "profile")} disabled={uploading} />
                        </label>
                        <input type="text" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Or paste image URL" className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Short Bio (shown in cards)</label>
                    <textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Brief biography for listing cards..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Experience (years)</label>
                      <input type="number" value={editing.experienceYears} onChange={(e) => setEditing({ ...editing, experienceYears: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                      <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Languages</label>
                    <input type="text" value={editing.languages} onChange={(e) => setEditing({ ...editing, languages: e.target.value })} placeholder="Arabic, French, English" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </>
              )}

              {/* Biography Tab */}
              {activeTab === "bio" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Biography (shown on profile page)</label>
                  <textarea value={editing.fullBio} onChange={(e) => setEditing({ ...editing, fullBio: e.target.value })} rows={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Detailed biography for the doctor's profile page..." />
                  <p className="text-[11px] text-gray-400 mt-1">Use double line breaks to create separate paragraphs.</p>
                </div>
              )}

              {/* Credentials Tab */}
              {activeTab === "credentials" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Education</label>
                      <button onClick={addEducation} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    {editing.education.length === 0 && <p className="text-xs text-gray-400 mb-4">No education entries yet.</p>}
                    <div className="space-y-3">
                      {editing.education.map((edu, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                          <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"><X className="w-3 h-3 text-gray-400" /></button>
                          <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Degree / Qualification" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          <input type="text" value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Institution" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          <input type="text" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="Year" className="w-24 px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Certifications &amp; Memberships</label>
                      <button onClick={addCertification} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    {editing.certifications.length === 0 && <p className="text-xs text-gray-400 mb-4">No certifications yet.</p>}
                    <div className="space-y-3">
                      {editing.certifications.map((cert, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                          <button onClick={() => removeCertification(i)} className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"><X className="w-3 h-3 text-gray-400" /></button>
                          <input type="text" value={cert.title} onChange={(e) => updateCertification(i, "title", e.target.value)} placeholder="Certification / Membership title" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          <input type="text" value={cert.issuer} onChange={(e) => updateCertification(i, "issuer", e.target.value)} placeholder="Issuing organization" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Gallery Tab */}
              {activeTab === "gallery" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-gray-600">Gallery Photos</label>
                    <label className={`text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                      {uploadingGallery ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      {uploadingGallery ? "Uploading..." : "Add Photo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} disabled={uploadingGallery} />
                    </label>
                  </div>
                  {editing.gallery.length === 0 && <p className="text-xs text-gray-400 mb-4">No gallery photos yet.</p>}
                  <div className="grid grid-cols-3 gap-3">
                    {editing.gallery.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden relative group border border-gray-200">
                        <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="150px" />
                        <button onClick={() => removeGalleryImage(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === "social" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instagram URL</label>
                    <input type="url" value={editing.socialLinks?.instagram || ""} onChange={(e) => setEditing({ ...editing, socialLinks: { ...editing.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/doctor" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                    <input type="url" value={editing.socialLinks?.facebook || ""} onChange={(e) => setEditing({ ...editing, socialLinks: { ...editing.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/doctor" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                    <input type="url" value={editing.socialLinks?.linkedin || ""} onChange={(e) => setEditing({ ...editing, socialLinks: { ...editing.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/doctor" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <p className="text-[11px] text-gray-400">Leave empty if not applicable.</p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => { setEditing(null); setIsNew(false); setActiveTab("basic"); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
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
