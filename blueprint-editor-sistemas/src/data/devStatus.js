export const DEV_STATUS = {
  planned: {
    key: "planned",
    label: "Planejado",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.35)",
  },
  in_progress: {
    key: "in_progress",
    label: "Em Dev",
    color: "#00c2ff",
    bg: "rgba(0,194,255,0.07)",
    border: "rgba(0,194,255,0.4)",
  },
  done: {
    key: "done",
    label: "Concluído",
    color: "#00e5a0",
    bg: "rgba(0,229,160,0.06)",
    border: "rgba(0,229,160,0.3)",
  },
};

// Priority: in_progress > planned > done
const PRIORITY = ["in_progress", "planned", "done"];

// items = array of objects that have a .devStatus field
export function getDominantStatus(items = []) {
  const statuses = items.map((s) => s.devStatus).filter(Boolean);
  return PRIORITY.find((p) => statuses.includes(p)) ?? null;
}
