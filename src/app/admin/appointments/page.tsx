"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Calendar, Phone, Plus, X, Trash2, ChevronLeft, ChevronRight, User } from "lucide-react";
import { type AppointmentRequest } from "@/data/admin";
const statusOptions = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

interface ClientOption {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ServiceOption {
  slug: string;
  title: string;
}

interface EmployeeOption {
  id: string;
  name: string;
  services: string[];
  active: boolean;
}

function createBlankAppointment(): AppointmentRequest {
  return {
    id: Date.now().toString(),
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
    notes: "",
    employeeId: "",
    employeeName: "",
  };
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AppointmentRequest | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calEmployee, setCalEmployee] = useState<string>("");
  const [calDate, setCalDate] = useState(() => new Date());

  const authHeaders = () => ({
    "x-auth-token": sessionStorage.getItem("haven_auth") ? JSON.parse(sessionStorage.getItem("haven_auth")!).token : "",
  });

  const loadData = useCallback(async () => {
    try {
      const [aptsRes, clientsRes, svcsRes, empRes] = await Promise.all([
        fetch("/api/admin/appointments"),
        fetch("/api/admin/clients"),
        fetch("/api/admin/services"),
        fetch("/api/admin/accounting/employees", { headers: authHeaders() }),
      ]);
      if (aptsRes.ok) setAppointments(await aptsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (svcsRes.ok) {
        const svcs = await svcsRes.json();
        setServices(svcs.map((s: { slug: string; title: string }) => ({ slug: s.slug, title: s.title })));
      }
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps.filter((e: EmployeeOption) => e.active));
      }
    } catch { /* API unavailable */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Employees filtered by selected service in the form
  const filteredEmployees = useMemo(() => {
    if (!editing?.service) return employees;
    // Find the service slug for the selected service title
    const svc = services.find((s) => s.title === editing.service);
    if (!svc) return employees;
    return employees.filter((e) => !e.services || e.services.length === 0 || e.services.includes(svc.slug));
  }, [editing?.service, employees, services]);

  const updateStatus = async (id: string, status: AppointmentRequest["status"]) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...apt, status }),
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      showToast(`Appointment ${status}`);
    } catch {
      showToast("Failed to update appointment");
    }
  };

  const handleAdd = () => {
    setEditing(createBlankAppointment());
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.service.trim()) {
      showToast("Name and service are required.");
      return;
    }
    try {
      if (isNew) {
        const res = await fetch("/api/admin/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setAppointments((prev) => [{ ...editing, id: created.id }, ...prev]);
        showToast("Appointment created");
      } else {
        await fetch(`/api/admin/appointments/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        setAppointments((prev) => prev.map((a) => (a.id === editing.id ? editing : a)));
        showToast("Appointment updated");
      }
    } catch {
      showToast("Failed to save appointment");
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
      showToast("Appointment deleted");
    } catch {
      showToast("Failed to delete appointment");
    }
  };

  const filtered = appointments.filter((apt) => {
    const matchFilter = filter === "all" || apt.status === filter;
    const matchSearch =
      search === "" ||
      apt.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.service.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

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
            <h3 className="text-lg font-bold text-gray-900">Delete Appointment?</h3>
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
        <div className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "New Appointment" : "Edit Appointment"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    value={editing.clientId || ""}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const client = clients.find((c) => c.id === cId);
                      if (client) {
                        setEditing({ ...editing, clientId: cId, name: client.name, email: client.email, phone: client.phone });
                      } else {
                        setEditing({ ...editing, clientId: "" });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">No client linked</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                  <select value={editing.service} onChange={(e) => {
                    const newService = e.target.value;
                    // Reset employee when service changes
                    setEditing({ ...editing, service: newService, employeeId: "", employeeName: "" });
                  }} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Employee</label>
                  <select value={editing.employeeId || ""} onChange={(e) => {
                    const empId = e.target.value;
                    const emp = employees.find((em) => em.id === empId);
                    setEditing({ ...editing, employeeId: empId, employeeName: emp?.name || "" });
                  }} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="">No employee assigned</option>
                    {filteredEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  {editing.service && filteredEmployees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No employees are assigned to this service yet.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as AppointmentRequest["status"] })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">
                {isNew ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all appointment requests and bookings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>List</button>
            <button onClick={() => setViewMode("calendar")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Calendar</button>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === status
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {apt.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{apt.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {apt.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{apt.service}</td>
                      <td className="px-5 py-4">
                        {apt.employeeName ? (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {apt.employeeName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {apt.date}
                        </p>
                        <p className="text-xs text-gray-500">{apt.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                          apt.status === "confirmed" ? "bg-green-100 text-green-700"
                          : apt.status === "pending" ? "bg-amber-100 text-amber-700"
                          : apt.status === "completed" ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                        }`}>{apt.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {apt.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(apt.id, "confirmed")} className="px-3 py-1 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">Confirm</button>
                              <button onClick={() => updateStatus(apt.id, "cancelled")} className="px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
                            </>
                          )}
                          {apt.status === "confirmed" && (
                            <button onClick={() => updateStatus(apt.id, "completed")} className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">Complete</button>
                          )}
                          <button onClick={() => { setEditing(apt); setIsNew(false); }} className="px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Edit</button>
                          <button onClick={() => setDeleteConfirm(apt.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                        No appointments found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmployeeCalendarView
          appointments={appointments}
          employees={employees}
          calEmployee={calEmployee}
          setCalEmployee={setCalEmployee}
          calDate={calDate}
          setCalDate={setCalDate}
          onEdit={(apt) => { setEditing(apt); setIsNew(false); }}
        />
      )}
    </div>
  );
}

/* ── Employee Calendar View ───────────────────────────────────────────── */
function EmployeeCalendarView({
  appointments, employees, calEmployee, setCalEmployee, calDate, setCalDate, onEdit,
}: {
  appointments: AppointmentRequest[];
  employees: EmployeeOption[];
  calEmployee: string;
  setCalEmployee: (v: string) => void;
  calDate: Date;
  setCalDate: (d: Date) => void;
  onEdit: (apt: AppointmentRequest) => void;
}) {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = calDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [selectedDate, setSelectedDate] = useState<string>("");

  const shiftMonth = (dir: -1 | 1) => {
    setCalDate(new Date(year, month + dir, 1));
  };

  // Filter appointments by employee
  const empAppointments = calEmployee
    ? appointments.filter((a) => a.employeeId === calEmployee)
    : appointments;

  // Group by date
  const aptsByDate: Record<string, AppointmentRequest[]> = {};
  for (const a of empAppointments) {
    if (a.date) {
      if (!aptsByDate[a.date]) aptsByDate[a.date] = [];
      aptsByDate[a.date].push(a);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedApts = selectedDate ? (aptsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      {/* Employee Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Filter by Employee</label>
          <select
            value={calEmployee}
            onChange={(e) => setCalEmployee(e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <button onClick={() => shiftMonth(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-gray-900 font-medium text-sm min-w-40 text-center">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-2 text-xs font-medium text-gray-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} className="h-20 border-b border-r border-gray-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayApts = aptsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? "" : dateStr)}
                className={`h-20 border-b border-r border-gray-50 p-1 cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? "bg-primary/5 ring-1 ring-primary/30" : ""
                }`}
              >
                <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isToday ? "bg-primary text-white" : "text-gray-700"
                }`}>{day}</span>
                {dayApts.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {dayApts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={`text-[10px] truncate rounded px-1 py-0.5 ${
                          a.status === "confirmed" ? "bg-green-100 text-green-700"
                          : a.status === "pending" ? "bg-amber-100 text-amber-700"
                          : a.status === "completed" ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-600"
                        }`}
                      >
                        {a.time ? `${a.time} ` : ""}{a.name.split(" ")[0]}
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <p className="text-[10px] text-gray-400 px-1">+{dayApts.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            <span className="ml-2 text-gray-400 font-normal">({selectedApts.length} appointment{selectedApts.length !== 1 ? "s" : ""})</span>
          </h3>
          {selectedApts.length === 0 ? (
            <p className="text-gray-400 text-sm">No appointments on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedApts.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {apt.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.name}</p>
                      <p className="text-xs text-gray-500">{apt.service}{apt.employeeName ? ` · ${apt.employeeName}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{apt.time}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      apt.status === "confirmed" ? "bg-green-100 text-green-700"
                      : apt.status === "pending" ? "bg-amber-100 text-amber-700"
                      : apt.status === "completed" ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-600"
                    }`}>{apt.status}</span>
                    <button onClick={() => onEdit(apt)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
