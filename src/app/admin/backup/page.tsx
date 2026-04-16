"use client";

import { useState } from "react";
import { Download, Upload, AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, XCircle } from "lucide-react";

interface PreviewRow { table: string; rows: number; status: string }
interface ImportResult { table: string; inserted: number; updated: number; errors: string[] }

export default function BackupPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function authHeaders(): Record<string, string> {
    const s = sessionStorage.getItem("haven_auth");
    return { "x-auth-token": s ? JSON.parse(s).token : "" };
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  // ── Export ────────────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/backup/export", { headers: authHeaders() });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `haven-backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "Backup downloaded successfully");
    } catch {
      showToast("error", "Failed to export backup");
    } finally { setExporting(false); }
  }

  // ── Import Preview ───────────────────────────────────────────────────
  async function handlePreview() {
    if (!file) return;
    setImporting(true);
    setResults(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", "preview");
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreview(data.preview);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Preview failed";
      showToast("error", msg);
    } finally { setImporting(false); }
  }

  // ── Import Confirm ──────────────────────────────────────────────────
  async function handleConfirmImport() {
    if (!file || confirmText !== "CONFIRM IMPORT") return;
    setShowConfirm(false);
    setConfirmText("");
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", "confirm");
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResults(data.results);
      setPreview(null);
      setFile(null);
      showToast("success", "Data imported successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      showToast("error", msg);
    } finally { setImporting(false); }
  }

  const readyCount = preview?.filter(p => p.status === "ready").reduce((s, p) => s + p.rows, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup &amp; Restore</h1>
        <p className="text-gray-500 mt-1">Export all clinic data or import from a previous backup</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Data Import</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>This action will <strong>write data to your database</strong>. Existing records with matching IDs will be <strong>updated</strong>, and new records will be <strong>inserted</strong>.</p>
              <p className="font-medium text-gray-800">{readyCount} rows across {preview?.filter(p => p.status === "ready").length} tables will be imported.</p>
              <p>Type <strong>CONFIRM IMPORT</strong> below to proceed:</p>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type CONFIRM IMPORT"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowConfirm(false); setConfirmText(""); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={confirmText !== "CONFIRM IMPORT"}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <Download className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Export Backup</h2>
            <p className="text-sm text-gray-500 mt-1">
              Download all clinic data as an Excel file. Each table is saved as a separate sheet.
              Includes appointments, clients, employees, services, blog posts, accounting, and more.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? "Exporting…" : "Download Backup"}
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload an Excel backup file to restore data. You will preview changes before anything is written.
              </p>
            </div>

            {/* File picker */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <FileSpreadsheet className="w-4 h-4" />
                {file ? file.name : "Choose .xlsx file"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => {
                    setFile(e.target.files?.[0] || null);
                    setPreview(null);
                    setResults(null);
                  }}
                />
              </label>
              {file && (
                <button
                  onClick={handlePreview}
                  disabled={importing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Preview Import
                </button>
              )}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Importing data will update existing records and insert new ones. Sensitive fields like passwords are never imported. Always export a backup before importing.</span>
            </div>

            {/* Preview Table */}
            {preview && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Import Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-2 font-medium">Table</th>
                        <th className="pb-2 font-medium">Rows</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map(p => (
                        <tr key={p.table} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{p.table}</td>
                          <td className="py-2">{p.rows}</td>
                          <td className="py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.some(p => p.status === "ready") && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Proceed to Import
                  </button>
                )}
              </div>
            )}

            {/* Results Table */}
            {results && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Import Complete
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-2 font-medium">Table</th>
                        <th className="pb-2 font-medium">Inserted</th>
                        <th className="pb-2 font-medium">Updated</th>
                        <th className="pb-2 font-medium">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.table} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{r.table}</td>
                          <td className="py-2 text-emerald-600 font-medium">{r.inserted}</td>
                          <td className="py-2 text-blue-600 font-medium">{r.updated}</td>
                          <td className="py-2">
                            {r.errors.length > 0 ? (
                              <span className="text-red-600 text-xs">{r.errors.length} error(s)</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {results.some(r => r.errors.length > 0) && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-red-600 font-medium">View errors</summary>
                    <ul className="mt-2 space-y-1 text-red-700 text-xs">
                      {results.flatMap(r => r.errors.map((e, i) => (
                        <li key={`${r.table}-${i}`} className="font-mono">[{r.table}] {e}</li>
                      )))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
