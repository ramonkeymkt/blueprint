import { DEV_STATUS } from "../data/devStatus";

export default function SystemPill({ sys, editing, onDelete, onStatusChange, onFunctionsChange }) {
  // sys = { id, devStatus, functionIds, name, vendor, availableFunctions }
  const cfg = sys.devStatus ? DEV_STATUS[sys.devStatus] : null;
  const fns = sys.availableFunctions || [];
  const selectedFnIds = sys.functionIds || [];

  const toggleFn = (fnId) => {
    const next = selectedFnIds.includes(fnId)
      ? selectedFnIds.filter((id) => id !== fnId)
      : [...selectedFnIds, fnId];
    onFunctionsChange(next);
  };

  const selectedFns = fns.filter((f) => selectedFnIds.includes(f.id));

  return (
    <div
      className="sys-pill"
      style={{
        flexDirection: "column",
        alignItems: "stretch",
        gap: editing ? 6 : 0,
        ...(cfg ? { borderColor: cfg.border, background: cfg.bg } : {}),
      }}
    >
      {/* Main row: dot + name | vendor + remove */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {cfg && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: cfg.color,
                flexShrink: 0,
                boxShadow: `0 0 5px ${cfg.color}99`,
              }}
            />
          )}
          {sys.name}
        </span>
        <span className="sys-vendor-mini" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {sys.vendor}
          {editing && (
            <button
              onClick={onDelete}
              title="Remover do setor"
              style={{
                background: "rgba(255,59,59,0.15)",
                border: "none",
                color: "#ff6b6b",
                borderRadius: 3,
                cursor: "pointer",
                fontSize: 10,
                padding: "0 4px",
                lineHeight: "16px",
              }}
            >
              ✕
            </button>
          )}
        </span>
      </div>

      {/* Selected functions — shown when not editing and there are selected ones */}
      {!editing && selectedFns.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
          {selectedFns.map((fn) => (
            <span
              key={fn.id}
              style={{
                fontSize: 8,
                padding: "1px 5px",
                borderRadius: 3,
                background: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {fn.name}
            </span>
          ))}
        </div>
      )}

      {/* Function toggles — only in edit mode, only if system has functions */}
      {editing && fns.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {fns.map((fn) => {
            const isSelected = selectedFnIds.includes(fn.id);
            return (
              <button
                key={fn.id}
                onClick={() => toggleFn(fn.id)}
                style={{
                  fontSize: 8,
                  padding: "2px 6px",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  border: isSelected ? "1px solid rgba(0,194,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: isSelected ? "rgba(0,194,255,0.12)" : "transparent",
                  color: isSelected ? "#00c2ff" : "#64748b",
                }}
              >
                {fn.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Status selector row — only in edit mode */}
      {editing && (
        <div style={{ display: "flex", gap: 3 }}>
          <button
            onClick={() => onStatusChange(null)}
            style={{
              flex: 1,
              fontSize: 8,
              padding: "2px 0",
              borderRadius: 3,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              border: !sys.devStatus ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
              background: !sys.devStatus ? "rgba(255,255,255,0.08)" : "transparent",
              color: !sys.devStatus ? "#e2e8f0" : "#374151",
            }}
          >
            —
          </button>

          {Object.values(DEV_STATUS).map((c) => {
            const isActive = sys.devStatus === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onStatusChange(c.key)}
                style={{
                  flex: 1,
                  fontSize: 8,
                  padding: "2px 0",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  border: isActive ? `1px solid ${c.color}70` : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? `${c.color}20` : "transparent",
                  color: isActive ? c.color : "#374151",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
