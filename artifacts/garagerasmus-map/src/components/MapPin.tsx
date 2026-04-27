import { useState, useRef } from "react";
import type { Member } from "@/data/members";

interface MapPinProps {
  member: Member;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editMode: boolean;
  selectedId: string | null;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
}

export function MapPin({
  member,
  containerRef,
  editMode,
  selectedId,
  onPositionChange,
  onSelect,
}: MapPinProps) {
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, pinX: 0, pinY: 0 });

  const isUniversity = member.type === "university";
  const isSelected = selectedId === member.id;

  const pinColor = isUniversity ? "#1e3a6e" : "#f5c518";
  const borderColor = isUniversity ? "#3399cc" : "#1e3a6e";

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(member.id);

    const container = containerRef.current;
    if (!container) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      pinX: member.x,
      pinY: member.y,
    };

    setIsDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const dx = ev.clientX - dragStartRef.current.mouseX;
      const dy = ev.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, Math.min(100, dragStartRef.current.pinX + (dx / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, dragStartRef.current.pinY + (dy / rect.height) * 100));
      onPositionChange(member.id, newX, newY);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) onSelect(member.id);
  };

  const showTooltip = !editMode && hovered;

  return (
    <div
      className="absolute"
      style={{
        left: `${member.x}%`,
        top: `${member.y}%`,
        transform: "translate(-50%, -100%)",
        zIndex: isDragging ? 1000 : isSelected ? 200 : hovered ? 100 : 10,
        cursor: editMode ? (isDragging ? "grabbing" : "grab") : "pointer",
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Pin SVG */}
      <svg
        width="34"
        height="44"
        viewBox="0 0 34 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isDragging
            ? "drop-shadow(0 6px 12px rgba(0,0,0,0.55))"
            : isSelected
            ? `drop-shadow(0 0 0 3px ${borderColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.4))`
            : hovered
            ? "drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
            : "drop-shadow(0 2px 5px rgba(0,0,0,0.35))",
          transform: hovered || isDragging ? "scale(1.2)" : isSelected ? "scale(1.15)" : "scale(1)",
          transition: isDragging ? "none" : "transform 0.15s ease, filter 0.15s ease",
          transformOrigin: "bottom center",
        }}
      >
        {/* Outer pin shape */}
        <path
          d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.611 26.389 0 17 0Z"
          fill={pinColor}
        />
        {/* Inner highlight ring */}
        <path
          d="M17 2C8.716 2 2 8.716 2 17C2 29 17 42 17 42C17 42 32 29 32 17C32 8.716 25.284 2 17 2Z"
          fill={pinColor}
          opacity={0.7}
        />
        {/* White circle dot */}
        <circle cx="17" cy="17" r="7.5" fill="white" opacity={0.95} />
        {/* Inner dot */}
        <circle cx="17" cy="17" r="4" fill={pinColor} opacity={0.65} />
      </svg>

      {/* Edit mode indicator ring */}
      {editMode && isSelected && (
        <div
          className="absolute"
          style={{
            inset: "-6px",
            borderRadius: "50%",
            border: `3px solid ${borderColor}`,
            animation: "pulse 1.5s infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip (view mode only) */}
      {showTooltip && (
        <div
          className="absolute"
          style={{
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "270px",
            zIndex: 999,
            pointerEvents: "auto",
          }}
        >
          <div
            className="rounded-xl shadow-2xl overflow-hidden"
            style={{
              border: `2px solid ${pinColor}`,
              backgroundColor: "#ffffff",
            }}
          >
            <div
              className="px-3 py-2.5"
              style={{ backgroundColor: pinColor }}
            >
              <span
                className="text-xs font-bold uppercase tracking-widest block"
                style={{ color: isUniversity ? "#f5c518" : "#1e3a6e", opacity: 0.9 }}
              >
                {isUniversity ? "University" : "gE4City"}
              </span>
              <p
                className="text-sm font-bold leading-tight mt-0.5"
                style={{ color: isUniversity ? "#ffffff" : "#1a2a4a" }}
              >
                {member.name}
              </p>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-xs text-gray-600 leading-relaxed" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {member.description}
              </p>
              {member.website && (
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: pinColor,
                    color: isUniversity ? "#ffffff" : "#1a2a4a",
                    textDecoration: "none",
                  }}
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `8px solid ${pinColor}`,
            }}
          />
        </div>
      )}
    </div>
  );
}
