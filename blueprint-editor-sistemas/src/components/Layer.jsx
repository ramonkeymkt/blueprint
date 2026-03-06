import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import EditableText from "./EditableText";
import SystemCard from "./SystemCard";
import HubCard from "./HubCard";

function DroppableGrid({ layerId, systems, sectorsRegistry, localEditing, isDragDisabled, onUpdate, onDelete, onAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id: layerId });

  return (
    <div
      ref={setNodeRef}
      className="systems-grid"
      style={{
        outline: isOver && !isDragDisabled ? "2px dashed rgba(0,194,255,0.4)" : "none",
        outlineOffset: -4,
        borderRadius: 8,
        transition: "outline 0.15s",
        minHeight: 60,
      }}
    >
      <SortableContext items={systems.map((s) => s.id)} strategy={rectSortingStrategy}>
        {systems.map((sysEntry) => (
          <SystemCard
            key={sysEntry.id}
            sysEntry={sysEntry}
            sectorsRegistry={sectorsRegistry}
            isDragDisabled={isDragDisabled}
            onChange={(newEntry) => onUpdate(sysEntry.id, newEntry)}
            onDelete={() => onDelete(sysEntry.id)}
          />
        ))}
      </SortableContext>

      {systems.length === 0 && (
        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", padding: "16px 0" }}>
          Nenhum sistema encontrado
        </div>
      )}

      {localEditing && (
        <button
          onClick={onAdd}
          style={{
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px dashed rgba(0,194,255,0.25)",
            background: "transparent",
            color: "#00c2ff",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          + sistema
        </button>
      )}
    </div>
  );
}

export default function Layer({ layer, sectorsRegistry, isDragDisabled, onChange, onDelete }) {
  const [localEditing, setLocalEditing] = useState(false);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!localEditing) return;
    const handler = (e) => {
      if (layerRef.current && !layerRef.current.contains(e.target)) {
        setLocalEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [localEditing]);

  const set = (key) => (val) => onChange({ ...layer, [key]: val });

  const updateSystem = (systemId, newEntry) =>
    onChange({ ...layer, systems: layer.systems.map((s) => (s.id === systemId ? newEntry : s)) });

  const deleteSystem = (systemId) =>
    onChange({ ...layer, systems: layer.systems.filter((s) => s.id !== systemId) });

  const addSystem = () => {
    const newEntry = { id: `sys-${Date.now()}`, name: "Novo Sistema", vendor: "", modules: [] };
    onChange({ ...layer, systems: [...(layer.systems || []), newEntry] });
  };

  const updateHub = (newHub) => onChange({ ...layer, hub: newHub });

  const badgeHtml = layer.type === "l1" ? (
    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 3, background: "rgba(255,59,59,0.15)", color: "#ff6b6b", fontFamily: "'IBM Plex Mono', monospace" }}>
      A CONSTRUIR
    </span>
  ) : null;

  return (
    <div ref={layerRef} className={`layer layer-${layer.type} ${layer.type}`}>
      <div className="layer-header">
        <div className="layer-number">
          <EditableText value={layer.number} onChange={set("number")} style={{ fontSize: 11 }} />
        </div>
        <div className="layer-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditableText value={layer.title} onChange={set("title")} />
          {badgeHtml}
        </div>
        <div className="layer-desc" style={{ marginLeft: "auto" }}>
          <EditableText value={layer.desc} onChange={set("desc")} style={{ fontSize: 12 }} />
        </div>

        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setLocalEditing((v) => !v)}
          title={localEditing ? "Fechar edição" : "Editar camada"}
          style={{
            marginLeft: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 3,
            color: localEditing ? "#00c2ff" : "rgba(100,116,139,0.3)",
          }}
        >
          {localEditing ? "✕" : "✎"}
        </button>

        {localEditing && (
          <button
            onClick={onDelete}
            title="Remover camada"
            style={{
              marginLeft: 4,
              background: "rgba(255,59,59,0.15)",
              border: "none",
              color: "#ff6b6b",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: 11,
              padding: "2px 8px",
            }}
          >
            ✕ camada
          </button>
        )}
      </div>

      {layer.isHub ? (
        <HubCard hub={layer.hub} editing={localEditing} onChange={updateHub} />
      ) : (
        <DroppableGrid
          layerId={layer.id}
          systems={layer.systems || []}
          sectorsRegistry={sectorsRegistry}
          localEditing={localEditing}
          isDragDisabled={isDragDisabled}
          onUpdate={updateSystem}
          onDelete={deleteSystem}
          onAdd={addSystem}
        />
      )}
    </div>
  );
}
