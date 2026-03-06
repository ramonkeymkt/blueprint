import EditableText from "./EditableText";

export default function HubCard({ hub, editing, onChange }) {
  const set = (key) => (val) => onChange({ ...hub, [key]: val });

  const updateHierarchy = (id, val) =>
    onChange({ ...hub, hierarchy: hub.hierarchy.map((h) => (h.id === id ? { ...h, label: val } : h)) });

  const addHierarchy = () => {
    const last = hub.hierarchy[hub.hierarchy.length - 1];
    const indent = last ? Math.min(last.indent + 1, 5) : 0;
    onChange({ ...hub, hierarchy: [...hub.hierarchy, { id: `h-${Date.now()}`, label: "↳ Novo item", indent }] });
  };

  const deleteHierarchy = (id) =>
    onChange({ ...hub, hierarchy: hub.hierarchy.filter((h) => h.id !== id) });

  const updateFeature = (id, val) =>
    onChange({ ...hub, features: hub.features.map((f) => (f.id === id ? { ...f, label: val } : f)) });

  const addFeature = () =>
    onChange({ ...hub, features: [...hub.features, { id: `f-${Date.now()}`, label: "→ Nova feature" }] });

  const deleteFeature = (id) =>
    onChange({ ...hub, features: hub.features.filter((f) => f.id !== id) });

  return (
    <div className="hub-card">
      <div className="hub-features">
        {hub.hierarchy.map((h) => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="hub-feat" style={{ marginLeft: h.indent * 12, flex: 1 }}>
              <EditableText value={h.label} onChange={(val) => updateHierarchy(h.id, val)} />
            </div>
            {editing && (
              <button
                onClick={() => deleteHierarchy(h.id)}
                style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 10, padding: "0 2px" }}
              >✕</button>
            )}
          </div>
        ))}
        {editing && (
          <button onClick={addHierarchy} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer", border: "1px dashed rgba(0,194,255,0.3)", background: "transparent", color: "#00c2ff", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            + item
          </button>
        )}
      </div>

      <div className="hub-center">
        <div className="hub-icon">⬡</div>
        <div className="hub-name">
          <EditableText value={hub.name} onChange={set("name")} />
        </div>
        <div className="hub-sub">
          <EditableText value={hub.subtitle} onChange={set("subtitle")} />
        </div>
      </div>

      <div className="hub-features">
        {hub.features.map((f) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="hub-feat" style={{ flex: 1 }}>
              <EditableText value={f.label} onChange={(val) => updateFeature(f.id, val)} />
            </div>
            {editing && (
              <button
                onClick={() => deleteFeature(f.id)}
                style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 10, padding: "0 2px" }}
              >✕</button>
            )}
          </div>
        ))}
        {editing && (
          <button onClick={addFeature} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer", border: "1px dashed rgba(0,194,255,0.3)", background: "transparent", color: "#00c2ff", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            + feature
          </button>
        )}
      </div>
    </div>
  );
}
