import { useEffect, useState } from "react";
import { Globe } from "@/components/Globe";
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

export default function MapPage() {
  const [members, setMembers] = useState<Member[]>(defaultMembers);

  useEffect(() => {
    fetchPinsFromServer().then((serverPins) => {
      if (serverPins && serverPins.length > 0) {
        setMembers(serverPins);
      }
    });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Globe
        members={members}
        editMode={false}
        selectedId={null}
        onSelect={() => {}}
        onPositionChange={() => {}}
      />
    </div>
  );
}
