import { useState, useEffect } from "react";
import type { Member, MemberType } from "@/data/members";

interface EditSidebarProps {
  member: Member | null;
  onClose: () => void;
  onSave: (updated: Member) => void;
  onDelete: (id: string) => void;
}

export function EditSidebar({ member, onClose, onSave, onDelete }: EditSidebarProps) {
  const [form, setForm] = useState<Member | null>(null);

  useEffect(() => {
    setForm(member ? { ...member } : null);
  }, [member]);

  if (!form) return null;

  const isUniversity = form.type === "university";
  const headerColor = isUniversity ? "#1e3a6e" : "#f5c518";
  const textColor = isUniversity ? "#f5c518" : "#1e3a6e";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: headerColor }}
      >
        <span className="text-sm font-bold" style={{ color: textColor }}>
          Edit Pin
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-opacity hover:opacity-70"
          style={{ color: isUniversity ? "#fff" : "#1e3a6e", backgroundColor: "rgba(0,0,0,0.15)" }}
        >
          ×
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Type toggle */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Type
          </label>
          <div className="flex gap-2">
            {(["university", "ge4city"] as MemberType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className="flex-1 py-1.5 text-xs font-bold rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: form.type === t ? (t === "university" ? "#1e3a6e" : "#f5c518") : "#f9fafb",
                  color: form.type === t ? (t === "university" ? "#fff" : "#1e3a6e") : "#9ca3af",
                  borderColor: form.type === t ? (t === "university" ? "#1e3a6e" : "#f5c518") : "#e5e7eb",
                }}
              >
                {t === "university" ? "University" : "gE4City"}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            style={{ borderColor: "#d1d5db" }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none resize-none"
            style={{ borderColor: "#d1d5db" }}
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Website URL</label>
          <input
            type="text"
            value={form.website ?? ""}
            placeholder="https://..."
            onChange={(e) => setForm({ ...form, website: e.target.value || undefined })}
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            style={{ borderColor: "#d1d5db" }}
          />
        </div>

        {/* Coordinates */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Position (drag pin on globe to move)
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-0.5">Longitude</label>
              <input
                type="number"
                step={0.1}
                value={Math.round(form.longitude * 10) / 10}
                onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm border rounded-lg px-2 py-1.5 outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-0.5">Latitude</label>
              <input
                type="number"
                step={0.1}
                value={Math.round(form.latitude * 10) / 10}
                onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm border rounded-lg px-2 py-1.5 outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t flex flex-col gap-2 flex-shrink-0" style={{ borderColor: "#e5e7eb" }}>
        <button
          onClick={() => onSave(form)}
          className="w-full py-2 text-sm font-bold rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1e3a6e" }}
        >
          Save Changes
        </button>
        <button
          onClick={() => { if (confirm("Delete this pin?")) onDelete(form.id); }}
          className="w-full py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
        >
          Delete Pin
        </button>
      </div>
    </div>
  );
}
