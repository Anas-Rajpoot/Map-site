import { useState, useCallback, useEffect, useRef } from "react";
import { Globe } from "@/components/Globe";
import { EditSidebar } from "@/components/EditSidebar";
import { members as defaultMembers, type Member } from "@/data/members";

const API_BASE = "/api";

async function fetchPinsFromServer(): Promise<Member[] | null> {
  try {
    const res = await fetch(`${API_BASE}/pins`);
    if (!res.ok) return null;
    const json = await res.json() as { data: Member[] | null };
    return json.data;
  } catch {
    return null;
  }
}

async function savePinsToServer(members: Member[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/pins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
  } catch {
    // fail silently — local state is already updated
  }
}

export default function MapPage() {
  const [allMembers, setAllMembers] = useState<Member[]>(defaultMembers);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "university" | "ge4city">("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Debounce server saves during rapid pin drags
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function debouncedSave(members: Member[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => savePinsToServer(members), 600);
  }

  // Load from server on mount; fall back to defaults
  useEffect(() => {
    fetchPinsFromServer().then((serverPins) => {
      if (serverPins && serverPins.length > 0) {
        setAllMembers(serverPins);
      }
      setLoaded(true);
    });
  }, []);

  const universityCount = allMembers.filter((m) => m.type === "university").length;
  const ge4Count = allMembers.filter((m) => m.type === "ge4city").length;

  const filteredMembers = allMembers.filter(
    (m) => activeFilter === "all" || m.type === activeFilter
  );

  const selectedMember = allMembers.find((m) => m.id === selectedId) ?? null;

  const updateMembers = useCallback((updated: Member[]) => {
    setAllMembers(updated);
    savePinsToServer(updated);
  }, []);

  const handlePositionChange = useCallback((id: string, lon: number, lat: number) => {
    setAllMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, longitude: lon, latitude: lat } : m));
      debouncedSave(next);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    (updated: Member) => {
      updateMembers(allMembers.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedId(null);
    },
    [allMembers, updateMembers]
  );

  const handleDelete = useCallback(
    (id: string) => {
      updateMembers(allMembers.filter((m) => m.id !== id));
      setSelectedId(null);
    },
    [allMembers, updateMembers]
  );

  const handleAddPin = useCallback(() => {
    const pin: Member = {
      id: `pin-${Date.now()}`,
      name: "New Location",
      type: "ge4city",
      description: "Click to edit this pin.",
      longitude: 15,
      latitude: 48,
    };
    updateMembers([...allMembers, pin]);
    setSelectedId(pin.id);
  }, [allMembers, updateMembers]);

  const handleReset = useCallback(() => {
    if (confirm("Reset all pins to their original positions and data?")) {
      setAllMembers(defaultMembers);
      savePinsToServer(defaultMembers);
      setSelectedId(null);
    }
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(allMembers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "garagerasmus-members.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [allMembers]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as Member[];
          updateMembers(parsed);
          setSelectedId(null);
        } catch {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [updateMembers]);

  return (
    <div
      className="flex flex-col w-full min-h-screen"
      style={{ backgroundColor: "#e8f4fd", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: "#1e3a6e" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#f5c518" }}
          >
            <span className="text-sm font-black" style={{ color: "#1e3a6e" }}>gE</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">garagErasmus Network</h1>
            <p className="text-blue-300 text-xs">Interactive Globe</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <svg width="10" height="14" viewBox="-5 -14 10 16"><path d="M 0,0 C -4.1,-3.9 -5,-6.8 -5,-9 A 5,5 0 1,1 5,-9 C 5,-6.8 4.1,-3.9 0,0 Z" fill="#4a7fd4" /><circle cx="0" cy="-9" r="1.9" fill="white" /></svg>
            <span className="text-white text-xs font-medium">{universityCount} Universities</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <svg width="10" height="14" viewBox="-5 -14 10 16"><path d="M 0,0 C -4.1,-3.9 -5,-6.8 -5,-9 A 5,5 0 1,1 5,-9 C 5,-6.8 4.1,-3.9 0,0 Z" fill="#f5c518" /><circle cx="0" cy="-9" r="1.9" fill="white" /></svg>
            <span className="text-white text-xs font-medium">{ge4Count} gE4Cities</span>
          </div>
          <button
            onClick={() => { setEditMode((v) => !v); setSelectedId(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: editMode ? "#f5c518" : "rgba(255,255,255,0.15)",
              color: editMode ? "#1e3a6e" : "#ffffff",
            }}
          >
            {editMode ? "✓ Done Editing" : "✏ Edit Map"}
          </button>
        </div>
      </header>

      {/* ── Edit toolbar ───────────────────────────────────── */}
      {editMode && (
        <div
          className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 flex-wrap"
          style={{ backgroundColor: "#f5c518" }}
        >
          <span className="text-xs font-bold text-yellow-900 hidden sm:inline">
            EDIT MODE:
          </span>
          <span className="text-xs text-yellow-800 hidden md:inline">
            Drag globe to rotate · Drag pin to reposition · Click pin to edit content
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={handleAddPin} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "#1e3a6e" }}>
              + Add Pin
            </button>
            <button onClick={handleExport} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: "#fff", color: "#1e3a6e", border: "1.5px solid #1e3a6e" }}>
              ↓ Export
            </button>
            <button onClick={handleImport} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(0,0,0,0.1)", color: "#78350f" }}>
              ↑ Import
            </button>
            <button onClick={handleReset} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(0,0,0,0.1)", color: "#78350f" }}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar (view mode) ─────────────────────────── */}
      {!editMode && (
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5"
          style={{ backgroundColor: "#1e3a6e" }}
        >
          <span className="text-blue-300 text-xs">Show:</span>
          {(["all", "university", "ge4city"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeFilter === f ? "#f5c518" : "rgba(255,255,255,0.12)",
                color: activeFilter === f ? "#1e3a6e" : "#ffffff",
              }}
            >
              {f === "all" ? "All" : f === "university" ? "Universities" : "gE4Cities"}
            </button>
          ))}
          <span className="text-blue-300 text-xs ml-auto hidden sm:inline">
            Scroll to zoom · Drag to rotate
          </span>
        </div>
      )}

      {/* ── Main: Globe + Edit Sidebar ──────────────────────── */}
      <main className="flex-1 flex min-h-0 gap-2 p-2" style={{ minHeight: 0 }}>
        {/* Globe — fills remaining space */}
        <div className="flex-1 relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(30,58,110,0.15)" }}>
          <Globe
            members={filteredMembers}
            editMode={editMode}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPositionChange={handlePositionChange}
          />
        </div>

        {/*
          Sidebar: ALWAYS rendered (fixed width) in edit mode.
          Keeping it always present prevents the globe from resizing
          when a pin is selected, which would corrupt drag coordinates.
        */}
        {editMode && (
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden hidden sm:flex flex-col"
            style={{
              width: 270,
              backgroundColor: "#ffffff",
              border: "2px solid #e5e7eb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          >
            {selectedMember ? (
              <EditSidebar
                member={selectedMember}
                onClose={() => setSelectedId(null)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#f0f4ff" }}
                >
                  <svg width="28" height="36" viewBox="-14 -36 28 40">
                    <path
                      d="M 0,0 C -11.5,-9.8 -14,-16.8 -14,-22 A 14,14 0 1,1 14,-22 C 14,-16.8 11.5,-9.8 0,0 Z"
                      fill="#3399cc"
                      opacity="0.4"
                    />
                    <circle cx="0" cy="-22" r="5.3" fill="white" opacity="0.7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Click a pin to edit</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Drag any pin on the globe to reposition it
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile: Edit sidebar as bottom panel */}
      {editMode && selectedMember && (
        <div
          className="flex-shrink-0 sm:hidden"
          style={{
            backgroundColor: "#ffffff",
            borderTop: "2px solid #e5e7eb",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          <EditSidebar
            member={selectedMember}
            onClose={() => setSelectedId(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 py-1.5 px-4 text-center"
        style={{ backgroundColor: "#1e3a6e" }}
      >
        <p className="text-blue-300 text-xs">
          {editMode
            ? "Edit mode · changes saved automatically · rotate globe to see all members worldwide"
            : "garagErasmus Foundation · Hover any pin · Scroll to zoom · Drag to explore the globe"}
        </p>
      </footer>
    </div>
  );
}
