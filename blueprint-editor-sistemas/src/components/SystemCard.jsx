import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditableText from "./EditableText";
import { DEV_STATUS, getDominantStatus } from "../data/devStatus";

// ── Sortable module row ────────────────────────────────────────────────────────
function ModuleRow({ moduleEntry, editing, sectorsRegistry, onUpdate, onRemove, onAddSector, onRemoveSector }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: moduleEntry.moduleId,
    disabled: !editing,
  });

  const modCfg = moduleEntry.devStatus ? DEV_STATUS[moduleEntry.devStatus] : null;
  const resolvedSectors = (moduleEntry.sectorIds || [])
    .map((id) => sectorsRegistry.find((s) => s.id === id))
    .filter(Boolean);
  const usedSectorIds = moduleEntry.sectorIds || [];
  const availableSectors = sectorsRegistry.filter((s) => !usedSectorIds.includes(s.id));

  return (
    <div
      ref={setNodeRef}
      className="module-row"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        ...(modCfg ? { borderColor: modCfg.border, background: modCfg.bg } : {}),
      }}
    >
      {/* Module header */}
      <div className="module-header">
        {/* Drag handle — only in edit mode */}
        {editing && (
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: "grab",
              color: "rgba(100,116,139,0.45)",
              fontSize: 12, lineHeight: 1,
              padding: "1px 3px", borderRadius: 2,
              userSelect: "none", touchAction: "none",
              flexShrink: 0,
            }}
          >⠿</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
          {modCfg && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: modCfg.color, boxShadow: `0 0 4px ${modCfg.color}99`,
            }} />
          )}
          <span className="module-name">
            <EditableText value={moduleEntry.name} onChange={(val) => onUpdate({ name: val })} />
          </span>
        </div>

        {editing && (
          <button
            onClick={onRemove}
            style={{
              marginLeft: 4, background: "rgba(255,59,59,0.15)",
              border: "none", color: "#ff6b6b", borderRadius: 3,
              cursor: "pointer", fontSize: 9, padding: "0 4px", lineHeight: "16px", flexShrink: 0,
            }}
          >✕</button>
        )}
      </div>

      {/* Status selector (edit mode) */}
      {editing && (
        <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
          <button
            onClick={() => onUpdate({ devStatus: null })}
            style={{
              flex: 1, fontSize: 8, padding: "2px 0", borderRadius: 3, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              border: !moduleEntry.devStatus ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
              background: !moduleEntry.devStatus ? "rgba(255,255,255,0.08)" : "transparent",
              color: !moduleEntry.devStatus ? "#e2e8f0" : "#374151",
            }}
          >—</button>
          {Object.values(DEV_STATUS).map((c) => {
            const isActive = moduleEntry.devStatus === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onUpdate({ devStatus: c.key })}
                style={{
                  flex: 1, fontSize: 8, padding: "2px 0", borderRadius: 3, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  border: isActive ? `1px solid ${c.color}70` : "1px solid rgba(255,255,255,0.07)",
                  background: isActive ? `${c.color}20` : "transparent",
                  color: isActive ? c.color : "#374151",
                }}
              >{c.label}</button>
            );
          })}
        </div>
      )}

      {/* Sector tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 5 }}>
        {resolvedSectors.map((sec) => (
          <span key={sec.id} className="sector-tag">
            {sec.name}
            {editing && (
              <button
                onClick={() => onRemoveSector(sec.id)}
                style={{ marginLeft: 3, background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 8, padding: 0 }}
              >✕</button>
            )}
          </span>
        ))}

        {editing && availableSectors.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => { onAddSector(e.target.value); e.target.value = ""; }}
            style={{
              fontSize: 8, padding: "2px 4px", borderRadius: 3,
              border: "1px dashed rgba(0,194,255,0.3)",
              background: "#0a0e1a", color: "#00c2ff",
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer", outline: "none",
            }}
          >
            <option value="" disabled>+ setor</option>
            {availableSectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ── System card ────────────────────────────────────────────────────────────────
export default function SystemCard({ sysEntry, sectorsRegistry, isDragDisabled, onChange, onDelete }) {
  const [localEditing, setLocalEditing] = useState(false);
  const [newModName, setNewModName] = useState("");
  const cardRef = useRef(null);

  // DnD for card (between layers)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sysEntry.id,
    disabled: !localEditing || isDragDisabled,
  });

  // Separate DnD for modules (within card)
  const moduleSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    if (!localEditing) return;
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setLocalEditing(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [localEditing]);

  const modules = sysEntry.modules || [];
  const dominantStatus = getDominantStatus(modules);
  const devCfg = dominantStatus ? DEV_STATUS[dominantStatus] : null;

  const set = (key) => (val) => onChange({ ...sysEntry, [key]: val });

  const handleModuleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((m) => m.moduleId === active.id);
    const newIndex = modules.findIndex((m) => m.moduleId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange({ ...sysEntry, modules: arrayMove(modules, oldIndex, newIndex) });
  };

  const addModule = () => {
    const name = newModName.trim();
    if (!name) return;
    onChange({
      ...sysEntry,
      modules: [...modules, { moduleId: `mod-${Date.now()}`, name, devStatus: null, sectorIds: [] }],
    });
    setNewModName("");
  };

  const removeModule = (moduleId) =>
    onChange({ ...sysEntry, modules: modules.filter((m) => m.moduleId !== moduleId) });

  const updateModule = (moduleId, patch) =>
    onChange({ ...sysEntry, modules: modules.map((m) => m.moduleId === moduleId ? { ...m, ...patch } : m) });

  const addSectorToModule = (moduleId, sectorId) => {
    if (!sectorId) return;
    const mod = modules.find((m) => m.moduleId === moduleId);
    if (!mod || (mod.sectorIds || []).includes(sectorId)) return;
    updateModule(moduleId, { sectorIds: [...(mod.sectorIds || []), sectorId] });
  };

  const removeSectorFromModule = (moduleId, sectorId) => {
    const mod = modules.find((m) => m.moduleId === moduleId);
    if (!mod) return;
    updateModule(moduleId, { sectorIds: (mod.sectorIds || []).filter((id) => id !== sectorId) });
  };

  return (
    <div
      ref={(node) => { setNodeRef(node); cardRef.current = node; }}
      className="system-card"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: "relative",
        ...(devCfg ? { background: devCfg.bg, borderColor: devCfg.border, boxShadow: `inset 0 2px 0 ${devCfg.color}` } : {}),
      }}
    >
      {/* Edit toggle */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setLocalEditing((v) => !v)}
        style={{
          position: "absolute", top: 5, right: 5,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 10, lineHeight: 1, padding: "2px 3px", borderRadius: 3,
          color: localEditing ? "#00c2ff" : "rgba(100,116,139,0.35)", zIndex: 2,
        }}
      >{localEditing ? "✕" : "✎"}</button>

      {localEditing && (
        <>
          {/* Card drag handle */}
          <div
            {...listeners}
            {...attributes}
            style={{
              position: "absolute", top: 6, left: 6,
              cursor: isDragDisabled ? "not-allowed" : "grab",
              color: isDragDisabled ? "rgba(100,116,139,0.2)" : "rgba(100,116,139,0.5)",
              fontSize: 14, lineHeight: 1, padding: "2px 3px", borderRadius: 3,
              userSelect: "none", touchAction: "none",
            }}
          >⠿</div>

          {/* Delete card */}
          <button
            onClick={onDelete}
            style={{
              position: "absolute", top: 22, right: 5,
              background: "rgba(255,59,59,0.15)", border: "none",
              color: "#ff6b6b", borderRadius: 3, cursor: "pointer",
              fontSize: 11, padding: "1px 5px", lineHeight: "16px", zIndex: 2,
            }}
          >✕</button>
        </>
      )}

      {/* System header */}
      <div className="system-header" style={localEditing ? { paddingLeft: 18 } : {}}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          {dominantStatus && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: DEV_STATUS[dominantStatus].color,
              boxShadow: `0 0 5px ${DEV_STATUS[dominantStatus].color}99`,
            }} />
          )}
          <span className="system-name">
            <EditableText value={sysEntry.name} onChange={set("name")} />
          </span>
        </div>
        <span className="sys-vendor-mini" style={{ flexShrink: 0 }}>
          <EditableText value={sysEntry.vendor} onChange={set("vendor")} />
        </span>
      </div>

      {/* Modules — with their own DnD context */}
      <DndContext
        sensors={moduleSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleModuleDragEnd}
      >
        <SortableContext items={modules.map((m) => m.moduleId)} strategy={verticalListSortingStrategy}>
          <div className="modules-list">
            {modules.map((moduleEntry) => (
              <ModuleRow
                key={moduleEntry.moduleId}
                moduleEntry={moduleEntry}
                editing={localEditing}
                sectorsRegistry={sectorsRegistry}
                onUpdate={(patch) => updateModule(moduleEntry.moduleId, patch)}
                onRemove={() => removeModule(moduleEntry.moduleId)}
                onAddSector={(sectorId) => addSectorToModule(moduleEntry.moduleId, sectorId)}
                onRemoveSector={(sectorId) => removeSectorFromModule(moduleEntry.moduleId, sectorId)}
              />
            ))}

            {/* Add module input */}
            {localEditing && (
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <input
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addModule(); }}
                  placeholder="Novo módulo..."
                  style={{
                    flex: 1, fontSize: 10, padding: "4px 7px", borderRadius: 4,
                    border: "1px dashed rgba(0,194,255,0.3)",
                    background: "rgba(0,194,255,0.04)", color: "#e2e8f0",
                    fontFamily: "'IBM Plex Mono', monospace", outline: "none",
                  }}
                />
                <button
                  onClick={addModule}
                  disabled={!newModName.trim()}
                  style={{
                    fontSize: 10, padding: "4px 8px", borderRadius: 4,
                    border: "1px solid rgba(0,194,255,0.3)",
                    background: newModName.trim() ? "rgba(0,194,255,0.1)" : "transparent",
                    color: newModName.trim() ? "#00c2ff" : "#374151",
                    cursor: newModName.trim() ? "pointer" : "not-allowed",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >+</button>
              </div>
            )}

            {!localEditing && modules.length === 0 && (
              <div style={{ fontSize: 9, color: "#475569", fontFamily: "'IBM Plex Mono', monospace", marginTop: 4, fontStyle: "italic" }}>
                sem módulos configurados
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
