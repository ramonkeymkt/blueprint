import { useState } from "react";

const inputStyle = {
  background: "rgba(0,194,255,0.07)",
  border: "1px solid rgba(0,194,255,0.35)",
  borderRadius: 4,
  color: "#e2e8f0",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  padding: "3px 7px",
  width: "100%",
  outline: "none",
};

function RegistryRow({ sys, usedBy, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(sys.name);
  const [vendor, setVendor] = useState(sys.vendor);
  const [newModName, setNewModName] = useState("");

  const save = () => {
    if (name.trim()) onUpdate({ ...sys, name: name.trim(), vendor: vendor.trim() });
    setEditing(false);
  };

  const mods = sys.modules || [];

  const addMod = () => {
    if (!newModName.trim()) return;
    onUpdate({ ...sys, modules: [...mods, { id: `mod-${Date.now()}`, name: newModName.trim() }] });
    setNewModName("");
  };

  const deleteMod = (id) =>
    onUpdate({ ...sys, modules: mods.filter((m) => m.id !== id) });

  return (
    <div style={{
      borderRadius: 6,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      {editing ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 28px", gap: 6, alignItems: "center", padding: "6px 8px" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
            style={inputStyle}
          />
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            placeholder="Vendor"
            style={inputStyle}
          />
          <button
            onClick={save}
            style={{ background: "rgba(0,229,160,0.15)", border: "none", color: "#00e5a0", borderRadius: 4, cursor: "pointer", fontSize: 12, padding: "4px 0" }}
          >✓</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px auto 28px", gap: 6, alignItems: "center", padding: "6px 8px" }}>
          <div
            onClick={() => setEditing(true)}
            title={`Presente em ${usedBy} camada(s)`}
            style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace", cursor: "text", display: "flex", alignItems: "center", gap: 6 }}
          >
            {sys.name}
            {usedBy > 0 && <span style={{ fontSize: 9, color: "#64748b" }}>({usedBy})</span>}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>
            {sys.vendor}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 3, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              border: "1px solid rgba(255,255,255,0.08)",
              background: expanded ? "rgba(0,194,255,0.1)" : "transparent",
              color: expanded ? "#00c2ff" : "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            {expanded ? "▾" : "▸"} {mods.length} mod
          </button>
          <button
            onClick={() => {
              if (usedBy > 0 && !window.confirm(`"${sys.name}" está em ${usedBy} camada(s). Remover mesmo assim?`)) return;
              onDelete(sys.id);
            }}
            style={{ background: "rgba(255,59,59,0.12)", border: "none", color: "#ff6b6b", borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "4px 0" }}
          >✕</button>
        </div>
      )}

      {/* Modules section */}
      {expanded && !editing && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {mods.map((mod) => (
            <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'IBM Plex Mono', monospace", flex: 1 }}>
                ↳ {mod.name}
              </span>
              <button
                onClick={() => deleteMod(mod.id)}
                style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 10, padding: "0 2px" }}
              >✕</button>
            </div>
          ))}
          {mods.length === 0 && (
            <div style={{ fontSize: 10, color: "#374151", fontFamily: "'IBM Plex Mono', monospace" }}>
              Nenhum módulo cadastrado
            </div>
          )}
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <input
              value={newModName}
              onChange={(e) => setNewModName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addMod(); }}
              placeholder="Novo módulo..."
              style={{ ...inputStyle, fontSize: 10, padding: "3px 6px" }}
            />
            <button
              onClick={addMod}
              disabled={!newModName.trim()}
              style={{
                padding: "3px 8px", borderRadius: 4,
                border: "1px solid rgba(0,194,255,0.3)",
                background: newModName.trim() ? "rgba(0,194,255,0.1)" : "transparent",
                color: newModName.trim() ? "#00c2ff" : "#374151",
                cursor: newModName.trim() ? "pointer" : "not-allowed",
                fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap",
              }}
            >+ add</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemsRegistry({ registry, layers, onUpdateRegistry, onClose }) {
  const [newName, setNewName] = useState("");
  const [newVendor, setNewVendor] = useState("");

  const usageCount = (sysId) =>
    layers.reduce((acc, l) => acc + (l.systems?.some((s) => s.id === sysId) ? 1 : 0), 0);

  const addSystem = () => {
    if (!newName.trim()) return;
    const newSys = { id: `reg-${Date.now()}`, name: newName.trim(), vendor: newVendor.trim(), modules: [] };
    onUpdateRegistry([...registry, newSys]);
    setNewName("");
    setNewVendor("");
  };

  const updateSystem = (updated) => onUpdateRegistry(registry.map((s) => (s.id === updated.id ? updated : s)));
  const deleteSystem = (id) => onUpdateRegistry(registry.filter((s) => s.id !== id));

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, background: "#0d1626", borderLeft: "1px solid rgba(0,194,255,0.15)", zIndex: 300, display: "flex", flexDirection: "column", boxShadow: "-16px 0 40px rgba(0,0,0,0.5)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#00c2ff", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Cadastro</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Sistemas</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#64748b", borderRadius: 6, cursor: "pointer", fontSize: 14, padding: "6px 10px" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px auto 28px", gap: 6, padding: "0 8px", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Nome</span>
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Vendor</span>
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Módulos</span>
          <span />
        </div>

        {registry.map((sys) => (
          <RegistryRow key={sys.id} sys={sys} usedBy={usageCount(sys.id)} onUpdate={updateSystem} onDelete={deleteSystem} />
        ))}

        {registry.length === 0 && (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", padding: "24px 0" }}>
            Nenhum sistema cadastrado
          </div>
        )}
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Adicionar sistema
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSystem()}
            placeholder="Nome do sistema"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "7px 10px", outline: "none" }}
          />
          <input
            value={newVendor}
            onChange={(e) => setNewVendor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSystem()}
            placeholder="Vendor (ex: Hinova)"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "7px 10px", outline: "none" }}
          />
          <button
            onClick={addSystem}
            disabled={!newName.trim()}
            style={{ padding: "8px", borderRadius: 6, border: "1px solid rgba(0,194,255,0.3)", background: newName.trim() ? "rgba(0,194,255,0.1)" : "transparent", color: newName.trim() ? "#00c2ff" : "#64748b", cursor: newName.trim() ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
