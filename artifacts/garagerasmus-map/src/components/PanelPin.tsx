import { useState } from "react";
import type { Member } from "@/data/members";

interface PanelPinProps {
  member: Member;
}

export function PanelPin({ member }: PanelPinProps) {
  const [hovered, setHovered] = useState(false);
  const isUniversity = member.type === "university";
  const pinColor = isUniversity ? "#1e3a6e" : "#f5c518";
  const dotColor = "#ffffff";

  return (
    <div
      className="absolute"
      style={{
        left: `${member.x}%`,
        top: `${member.y}%`,
        transform: "translate(-50%, -100%)",
        zIndex: hovered ? 50 : 5,
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width="22"
        height="28"
        viewBox="0 0 28 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: hovered
            ? "drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
            : "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
          transform: hovered ? "scale(1.25)" : "scale(1)",
          transition: "transform 0.15s ease",
          transformOrigin: "bottom center",
        }}
      >
        <path
          d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
          fill={pinColor}
        />
        <path
          d="M14 1.5C7.1 1.5 1.5 7.1 1.5 14C1.5 24 14 34.5 14 34.5C14 34.5 26.5 24 26.5 14C26.5 7.1 20.9 1.5 14 1.5Z"
          fill={pinColor}
          opacity="0.85"
        />
        <circle cx="14" cy="14" r="6" fill={dotColor} opacity="0.9" />
        <circle cx="14" cy="14" r="3.5" fill={pinColor} opacity="0.7" />
      </svg>

      {hovered && (
        <div
          className="absolute z-50"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            pointerEvents: "none",
          }}
        >
          <div
            className="rounded-lg shadow-xl border overflow-hidden"
            style={{
              backgroundColor: "white",
              borderColor: isUniversity ? "#1e3a6e" : "#f5c518",
              borderWidth: "2px",
            }}
          >
            <div
              className="px-2.5 py-1.5"
              style={{ backgroundColor: isUniversity ? "#1e3a6e" : "#f5c518" }}
            >
              <p
                className="text-xs font-bold leading-tight"
                style={{ color: isUniversity ? "#ffffff" : "#1a2a4a" }}
              >
                {member.name}
              </p>
            </div>
            <div className="px-2.5 py-1.5">
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                {member.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
