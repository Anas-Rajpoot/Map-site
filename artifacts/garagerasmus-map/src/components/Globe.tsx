import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { feature, mesh } from "topojson-client";
import type { Member } from "@/data/members";

const LAND_COLOR = "#3399cc";
const OCEAN_COLOR = "#f2f8fd";
const BORDER_COLOR = "rgba(255,255,255,0.75)";
const GRATICULE_COLOR = "rgba(51,153,204,0.13)";
const WORLD_ATLAS = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobeProps {
  members: Member[];
  editMode: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, lon: number, lat: number) => void;
}

interface PinDatum extends Member {
  sx: number;
  sy: number;
}

export function Globe({ members, editMode, selectedId, onSelect, onPositionChange }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [translate, setTranslate] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  const dragging = useRef({
    active: false,
    pinId: null as string | null,
    lastX: 0,
    lastY: 0,
    moved: false,
  });
  const touchRef = useRef({ lastX: 0, lastY: 0, pinchDist: 0 });
  const viewInitialized = useRef(false);

  // Once the real container size is known, set initial zoom centred on Europe
  useEffect(() => {
    if (viewInitialized.current || size.w < 50) return;
    viewInitialized.current = true;
    const initZoom = 3;
    const initProj = d3
      .geoNaturalEarth1()
      .scale((153 * size.w) / 960 * initZoom)
      .translate([size.w / 2, size.h / 2]);
    const europeCenter: [number, number] = [15, 50];
    const [px, py] = initProj(europeCenter)!;
    setZoom(initZoom);
    setTranslate([size.w / 2 - px, size.h / 2 - py]);
  }, [size]);

  // Container size observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Load world atlas TopoJSON
  useEffect(() => {
    fetch(WORLD_ATLAS)
      .then((r) => r.json())
      .then(setWorldData)
      .catch(() =>
        fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
          .then((r) => r.json())
          .then(setWorldData)
      );
  }, []);

  // geoNaturalEarth1: scale=153 fills ~960px wide at zoom=1
  const projection = useMemo(
    () =>
      d3
        .geoNaturalEarth1()
        .scale((153 * size.w) / 960 * zoom)
        .translate([size.w / 2 + translate[0], size.h / 2 + translate[1]]),
    [size, zoom, translate]
  );

  const pathGen = useMemo(() => d3.geoPath(projection), [projection]);

  const { countryPaths, borderPath, graticulePath } = useMemo(() => {
    if (!worldData) return { countryPaths: [], borderPath: "", graticulePath: "" };
    const feats = (feature(worldData, worldData.objects.countries) as any).features as any[];
    const paths = feats
      .map((f, i) => ({ id: f.id ?? `c${i}`, d: pathGen(f) ?? "" }))
      .filter((p) => p.d);
    const border =
      pathGen(mesh(worldData, worldData.objects.countries as any, (a: any, b: any) => a !== b)) ?? "";
    const grat = pathGen(d3.geoGraticule()()) ?? "";
    return { countryPaths: paths, borderPath: border, graticulePath: grat };
  }, [worldData, pathGen]);

  // Flat map: all points project correctly, no hemisphere check needed
  const pinData = useMemo<PinDatum[]>(() => {
    return members
      .map((m) => {
        const xy = projection([m.longitude, m.latitude]);
        if (!xy) return null;
        return { ...m, sx: xy[0], sy: xy[1] };
      })
      .filter(Boolean) as PinDatum[];
  }, [members, projection]);

  // ── Mouse events ─────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      const pinEl = (e.target as Element).closest("[data-pin-id]") as SVGElement | null;
      const pinId = pinEl?.dataset?.pinId ?? null;
      dragging.current = {
        active: true,
        pinId,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
      };
      if (pinId && editMode) onSelect(pinId);
      else if (!pinId && editMode) onSelect(null);
    },
    [editMode, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { active, pinId, lastX, lastY } = dragging.current;
      if (!active) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      dragging.current.lastX = e.clientX;
      dragging.current.lastY = e.clientY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragging.current.moved = true;

      if (pinId && editMode) {
        const rect = e.currentTarget.getBoundingClientRect();
        const inv = projection.invert!([e.clientX - rect.left, e.clientY - rect.top]);
        if (inv) onPositionChange(pinId, inv[0], inv[1]);
      } else {
        setTranslate(([tx, ty]) => [tx + dx, ty + dy]);
      }
    },
    [editMode, projection, onPositionChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { pinId, moved } = dragging.current;
      if (!moved && pinId && !editMode) {
        setHovered(pinId);
      }
      dragging.current.active = false;
    },
    [editMode]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((z) => Math.max(0.3, Math.min(12, z * factor)));
  }, []);

  // ── Touch events ─────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      touchRef.current.lastX = e.touches[0].clientX;
      touchRef.current.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.pinchDist = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.lastX;
      const dy = e.touches[0].clientY - touchRef.current.lastY;
      touchRef.current.lastX = e.touches[0].clientX;
      touchRef.current.lastY = e.touches[0].clientY;
      setTranslate(([tx, ty]) => [tx + dx, ty + dy]);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / (touchRef.current.pinchDist || dist);
      touchRef.current.pinchDist = dist;
      setZoom((z) => Math.max(0.3, Math.min(12, z * factor)));
    }
  }, []);

  const hoveredMember = pinData.find((m) => m.id === hovered) ?? null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden"
      style={{ background: OCEAN_COLOR }}
    >
      {/* Loading state */}
      {!worldData && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-3"
              style={{ borderColor: "#dde8f0", borderTopColor: "#3399cc" }}
            />
            <p className="text-sm font-medium" style={{ color: "#3399cc" }}>
              Loading map…
            </p>
          </div>
        </div>
      )}

      {/* SVG flat map */}
      <svg
        width={size.w}
        height={size.h}
        style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragging.current.active = false; }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { dragging.current.active = false; }}
      >
        {/* Ocean background */}
        <rect x={0} y={0} width={size.w} height={size.h} fill={OCEAN_COLOR} />

        {/* Graticule (subtle grid lines) */}
        <path d={graticulePath} fill="none" stroke={GRATICULE_COLOR} strokeWidth="0.5" />

        {/* Land (countries) */}
        {countryPaths.map(({ id, d }) => (
          <path key={id} d={d} fill={LAND_COLOR} />
        ))}

        {/* Country borders */}
        <path d={borderPath} fill="none" stroke={BORDER_COLOR} strokeWidth="0.55" />

        {/* ── Pins ── */}
        {pinData.map((pin) => {
          const isSelected = selectedId === pin.id;
          const isHov = hovered === pin.id;
          const isUniversity = pin.type === "university";
          const pinColor = isUniversity ? "#1e3a6e" : "#f5c518";
          const baseR = isSelected ? 11 : isHov ? 10 : 8.5;
          const R = baseR;
          const H = R * 2.55;
          const cy0 = -(H - R);
          const holeR = R * 0.38;

          const pinPath = `
            M 0,0
            C ${-R * 0.82},${H * -0.28}  ${-R},${H * -0.48}  ${-R},${cy0}
            A ${R},${R} 0 1,1 ${R},${cy0}
            C ${R},${H * -0.48}  ${R * 0.82},${H * -0.28}  0,0 Z
          `;

          const scaleFactor = isSelected ? 1.22 : isHov ? 1.12 : 1;

          return (
            <g
              key={pin.id}
              data-pin-id={pin.id}
              style={{ cursor: editMode ? "grab" : "pointer" }}
              onMouseEnter={() => { if (!editMode) setHovered(pin.id); }}
              onMouseLeave={() => setHovered(null)}
              transform={`translate(${pin.sx}, ${pin.sy}) scale(${scaleFactor})`}
            >
              <ellipse
                cx={0}
                cy={1.5}
                rx={R * 0.55}
                ry={R * 0.17}
                fill="rgba(0,0,0,0.22)"
                pointerEvents="none"
              />
              <path
                d={pinPath}
                fill={pinColor}
                stroke={isSelected ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.12)"}
                strokeWidth={isSelected ? 1.8 : 0.6}
                style={{
                  filter: isSelected
                    ? "drop-shadow(0 0 6px rgba(255,255,255,0.85))"
                    : isHov
                    ? "drop-shadow(0 3px 7px rgba(0,0,0,0.38))"
                    : "drop-shadow(0 2px 4px rgba(0,0,0,0.28))",
                }}
              />
              <circle
                cx={0}
                cy={cy0}
                r={holeR}
                fill="white"
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {/* ── Tooltip (hover in view mode) ── */}
      {hoveredMember && !editMode && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: hoveredMember.sx,
            top: hoveredMember.sy - 30,
            transform: "translate(-50%, -100%)",
            width: 250,
          }}
        >
          <div
            className="rounded-xl shadow-2xl overflow-hidden"
            style={{ border: `2px solid ${hoveredMember.type === "university" ? "#1e3a6e" : "#f5c518"}` }}
          >
            <div
              className="px-3 py-2.5"
              style={{ backgroundColor: hoveredMember.type === "university" ? "#1e3a6e" : "#f5c518" }}
            >
              <span
                className="text-xs font-bold uppercase tracking-wide block opacity-80"
                style={{ color: hoveredMember.type === "university" ? "#f5c518" : "#1e3a6e" }}
              >
                {hoveredMember.type === "university" ? "University" : "gE4City"}
              </span>
              <p
                className="text-sm font-bold leading-snug"
                style={{ color: hoveredMember.type === "university" ? "#ffffff" : "#1a2a4a" }}
              >
                {hoveredMember.name}
              </p>
            </div>
            <div className="px-3 py-2 bg-white">
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                {hoveredMember.description}
              </p>
              {hoveredMember.website && (
                <a
                  href={hoveredMember.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: hoveredMember.type === "university" ? "#1e3a6e" : "#f5c518",
                    color: hoveredMember.type === "university" ? "#fff" : "#1a2a4a",
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit website →
                </a>
              )}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -7,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: `7px solid ${hoveredMember.type === "university" ? "#1e3a6e" : "#f5c518"}`,
            }}
          />
        </div>
      )}

      {/* ── Edit hint ── */}
      {editMode && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-semibold pointer-events-none z-50 whitespace-nowrap"
          style={{ backgroundColor: "rgba(30,58,110,0.88)", color: "#f5c518" }}
        >
          Drag map to pan · Drag a pin to move it · Click pin to edit
        </div>
      )}

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-40">
        {[
          { label: "+", action: () => setZoom((z) => Math.min(12, z * 1.3)) },
          { label: "−", action: () => setZoom((z) => Math.max(0.3, z * 0.77)) },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-opacity hover:opacity-80 active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1e3a6e", border: "1px solid #dde8f0" }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => {
            const initZoom = 3;
            const initProj = d3
              .geoNaturalEarth1()
              .scale((153 * size.w) / 960 * initZoom)
              .translate([size.w / 2, size.h / 2]);
            const [px, py] = initProj([15, 50] as [number, number])!;
            setZoom(initZoom);
            setTranslate([size.w / 2 - px, size.h / 2 - py]);
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-md transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1e3a6e", border: "1px solid #dde8f0" }}
          title="Reset view"
        >
          ⌂
        </button>
      </div>

      {/* Legend */}
      {!editMode && (
        <div
          className="absolute bottom-4 left-4 rounded-xl p-3 shadow-md z-40"
          style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid #dde8f0" }}
        >
          <p className="text-xs font-bold text-gray-600 mb-1.5">Legend</p>
          {[
            { color: "#1e3a6e", label: "University / Foundation" },
            { color: "#f5c518", label: "gE4City" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 mb-1">
              <svg width="12" height="17" viewBox="-6 -17 12 19">
                <path
                  d="M 0,0 C -4.9,-4.7 -6,-8.2 -6,-11 A 6,6 0 1,1 6,-11 C 6,-8.2 4.9,-4.7 0,0 Z"
                  fill={color}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="0.5"
                />
                <circle cx="0" cy="-11" r="2.3" fill="white" />
              </svg>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
