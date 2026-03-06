import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditableText from "./EditableText";
import SystemPill from "./SystemPill";
import { DEV_STATUS, getDominantStatus } from "../data/devStatus";

export default function SectorCard({ sector, registry = [], isDragDisabled, onChange, onDelete }) {
  const [localEditing, setLocalEditing] = useState(false);
  const cardRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sector.id,
    disabled: !localEditing || isDragDisabled,
  });

  // Close on click outside
  useEffect(() => {
    if (!localEditing) return;
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setLocalEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [localEditing]);

  const systems = sector.systems || [];

  const resolvedSystems = systems
    .map((entry) => {
      const reg = registry.find((r) => r.id === entry.id);
      return reg ? { ...entry, name: reg.name, vendor: reg.vendor, availableFunctions: reg.functions || [] } : null;
    })
    .filter(Boolean);

  const usedIds = systems.map((s) => s.id);
  const availableSystems = registry.filter((r) => !usedIds.includes(r.id));

  const dominantStatus = getDominantStatus(systems);
  const devCfg = dominantStatus ? DEV_STATUS[dominantStatus] : null;

  const addSystem = (sysId) => {
    if (!sysId) return;
    onChange({ ...sector, systems: [...systems, { id: sysId, devStatus: null, functionIds: [] }] });
  };

  const updateSystemFunctions = (sysId, functionIds) => {
    onChange({ ...sector, systems: systems.map((s) => s.id === sysId ? { ...s, functionIds } : s) });
  };

  const removeSystem = (sysId) => {
    onChange({ ...sector, systems: systems.filter((s) => s.id !== sysId) });
  };

  const updateSystemStatus = (sysId, devStatus) => {
    onChange({ ...sector, systems: systems.map((s) => s.id === sysId ? { ...s, devStatus } : s) });
  };

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    ...(devCfg ? {
      background: devCfg.bg,
      borderColor: devCfg.border,
      boxShadow: `inset 0 2px 0 ${devCfg.color}`,
    } : {}),
  };

  return (
    <div
      ref={(node) => { setNodeRef(node); cardRef.current = node; }}
      style={cardStyle}
      className="sector-card"
    >
      {/* Pencil toggle — top-right, low opacity when idle */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setLocalEditing((v) => !v)}
        title={localEditing ? "Fechar edição" : "Editar card"}
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 10,
          lineHeight: 1,
          padding: "2px 3px",
          borderRadius: 3,
          color: localEditing ? "#00c2ff" : "rgba(100,116,139,0.35)",
          zIndex: 2,
        }}
      >
        {localEditing ? "✕" : "✎"}
      </button>

      {localEditing && (
        <>
          {/* Drag handle */}
          <div
            {...listeners}
            {...attributes}
            title="Arrastar"
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              cursor: isDragDisabled ? "not-allowed" : "grab",
              color: isDragDisabled ? "rgba(100,116,139,0.2)" : "rgba(100,116,139,0.5)",
              fontSize: 14,
              lineHeight: 1,
              padding: "2px 3px",
              borderRadius: 3,
              userSelect: "none",
              touchAction: "none",
            }}
          >
            ⠿
          </div>
          {/* Delete sector */}
          <button
            onClick={onDelete}
            title="Remover setor"
            style={{
              position: "absolute",
              top: 22,
              right: 5,
              background: "rgba(255,59,59,0.15)",
              border: "none",
              color: "#ff6b6b",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: 11,
              padding: "1px 5px",
              lineHeight: "16px",
              zIndex: 2,
            }}
          >
            ✕
          </button>
        </>
      )}

      <div className="sector-name" style={localEditing ? { paddingLeft: 18 } : {}}>
        <EditableText
          value={sector.name}
          onChange={(val) => onChange({ ...sector, name: val })}
        />
      </div>

      <div className="sys-list">
        {resolvedSystems.map((sys) => (
          <SystemPill
            key={sys.id}
            sys={sys}
            editing={localEditing}
            onDelete={() => removeSystem(sys.id)}
            onStatusChange={(status) => updateSystemStatus(sys.id, status)}
            onFunctionsChange={(fnIds) => updateSystemFunctions(sys.id, fnIds)}
          />
        ))}

        {localEditing && availableSystems.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => { addSystem(e.target.value); e.target.value = ""; }}
            style={{
              fontSize: 10,
              padding: "4px 6px",
              borderRadius: 4,
              border: "1px dashed rgba(0,194,255,0.3)",
              background: "#0a0e1a",
              color: "#00c2ff",
              fontFamily: "'IBM Plex Mono', monospace",
              marginTop: 4,
              width: "100%",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="" disabled>+ adicionar sistema...</option>
            {availableSystems.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.vendor}</option>
            ))}
          </select>
        )}

        {localEditing && availableSystems.length === 0 && registry.length > 0 && (
          <div style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4, textAlign: "center" }}>
            todos os sistemas adicionados
          </div>
        )}
      </div>
    </div>
  );
}
