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

function SectorRow({ sector, usedBy, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sector.name);

  const save = () => {
    if (name.trim()) onUpdate({ ...sector, name: name.trim() });
    setEditing(false);
  };

  return (
    <div style={{
      borderRadius: 6,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      {editing ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: 6, alignItems: "center", padding: "6px 8px" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
            style={inputStyle}
          />
          <button
            onClick={save}
            style={{ background: "rgba(0,229,160,0.15)", border: "none", color: "#00e5a0", borderRadius: 4, cursor: "pointer", fontSize: 12, padding: "4px 0" }}
          >✓</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: 6, alignItems: "center", padding: "6px 8px" }}>
          <div
            onClick={() => setEditing(true)}
            title={`Usado em ${usedBy} módulo(s)`}
            style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace", cursor: "text", display: "flex", alignItems: "center", gap: 6 }}
          >
            {sector.name}
            {usedBy > 0 && <span style={{ fontSize: 9, color: "#64748b" }}>({usedBy})</span>}
          </div>
          <button
            onClick={() => {
              if (usedBy > 0 && !window.confirm(`"${sector.name}" está em ${usedBy} módulo(s). Remover mesmo assim?`)) return;
              onDelete(sector.id);
            }}
            style={{ background: "rgba(255,59,59,0.12)", border: "none", color: "#ff6b6b", borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "4px 0" }}
          >✕</button>
        </div>
      )}
    </div>
  );
}

export default function SectorsRegistry({ sectorsRegistry, layers, onUpdateSectorsRegistry, onClose }) {
  const [newName, setNewName] = useState("");

  const usageCount = (secId) => {
    let count = 0;
    layers.forEach((l) =>
      l.systems?.forEach((s) =>
        (s.modules || []).forEach((mod) => {
          if ((mod.sectorIds || []).includes(secId)) count++;
        })
      )
    );
    return count;
  };

  const addSector = () => {
    if (!newName.trim()) return;
    const newSec = { id: `sec-${Date.now()}`, name: newName.trim() };
    onUpdateSectorsRegistry([...sectorsRegistry, newSec]);
    setNewName("");
  };

  const updateSector = (updated) =>
    onUpdateSectorsRegistry(sectorsRegistry.map((s) => (s.id === updated.id ? updated : s)));

  const deleteSector = (id) =>
    onUpdateSectorsRegistry(sectorsRegistry.filter((s) => s.id !== id));

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, background: "#0d1626", borderLeft: "1px solid rgba(0,194,255,0.15)", zIndex: 300, display: "flex", flexDirection: "column", boxShadow: "-16px 0 40px rgba(0,0,0,0.5)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#00c2ff", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Cadastro</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Setores</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#64748b", borderRadius: 6, cursor: "pointer", fontSize: 14, padding: "6px 10px" }}>✕</button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: 6, padding: "0 8px", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Nome</span>
          <span />
        </div>

        {sectorsRegistry.map((sector) => (
          <SectorRow
            key={sector.id}
            sector={sector}
            usedBy={usageCount(sector.id)}
            onUpdate={updateSector}
            onDelete={deleteSector}
          />
        ))}

        {sectorsRegistry.length === 0 && (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", padding: "24px 0" }}>
            Nenhum setor cadastrado
          </div>
        )}
      </div>

      {/* Add new */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Adicionar setor
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSector()}
            placeholder="Nome do setor"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "7px 10px", outline: "none" }}
          />
          <button
            onClick={addSector}
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
