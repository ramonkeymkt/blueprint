import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import "./App.css";
import { initialData, migrateData } from "./data/initialData";
import { DEV_STATUS } from "./data/devStatus";
import Header from "./components/Header";
import Layer from "./components/Layer";
import Footer from "./components/Footer";
import Toolbar from "./components/Toolbar";
import FilterSortBar from "./components/FilterSortBar";
import SectorsRegistry from "./components/SectorsRegistry";

const STORAGE_KEY = "blueprint-data-v1";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return migrateData(JSON.parse(saved));
  } catch {}
  return initialData;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [sectorsRegistryOpen, setSectorsRegistryOpen] = useState(false);
  const [activeSystem, setActiveSystem] = useState(null);

  // Filter & sort state
  const [activeSectorFilters, setActiveSectorFilters] = useState([]);
  const [activeDevFilters, setActiveDevFilters] = useState([]);
  const [sort, setSort] = useState(null);

  const isDragDisabled = sort !== null || activeSectorFilters.length > 0 || activeDevFilters.length > 0;

  const sectorsRegistry = useMemo(
    () => [...(data.sectorsRegistry || [])].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [data.sectorsRegistry]
  );

  useEffect(() => { saveData(data); }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Derived: filtered + sorted view of layers
  const displayLayers = useMemo(() => {
    return data.layers.map((layer) => {
      if (layer.isHub || !layer.systems) return layer;

      let systems = [...layer.systems];

      if (activeSectorFilters.length > 0) {
        systems = systems.filter((s) =>
          (s.modules || []).some((mod) =>
            (mod.sectorIds || []).some((id) => activeSectorFilters.includes(id))
          )
        );
      }

      if (activeDevFilters.length > 0) {
        systems = systems.filter((s) =>
          (s.modules || []).some((mod) => mod.devStatus && activeDevFilters.includes(mod.devStatus))
        );
      }

      if (sort === "asc") {
        systems = [...systems].sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
      }
      if (sort === "desc") {
        systems = [...systems].sort((a, b) => (b.name || "").localeCompare(a.name || "", "pt-BR"));
      }

      return { ...layer, systems };
    });
  }, [data.layers, activeSectorFilters, activeDevFilters, sort]);

  const visibleLayers = useMemo(() => {
    if (activeSectorFilters.length === 0 && activeDevFilters.length === 0) return displayLayers;
    return displayLayers.filter((l) => l.isHub || (l.systems && l.systems.length > 0));
  }, [displayLayers, activeSectorFilters, activeDevFilters]);

  const toggleSectorFilter = (secId) => {
    setActiveSectorFilters((prev) =>
      prev.includes(secId) ? prev.filter((id) => id !== secId) : [...prev, secId]
    );
  };

  const toggleDevFilter = (status) => {
    setActiveDevFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setActiveSectorFilters([]);
    setActiveDevFilters([]);
    setSort(null);
  };

  const updateHeader = useCallback((header) => setData((d) => ({ ...d, header })), []);
  const updateFooter = useCallback((footer) => setData((d) => ({ ...d, footer })), []);

  const updateSectorsRegistry = useCallback((newSectorsRegistry) => {
    setData((d) => {
      const removedIds = (d.sectorsRegistry || [])
        .map((s) => s.id)
        .filter((id) => !newSectorsRegistry.find((s) => s.id === id));

      const layers = removedIds.length > 0
        ? d.layers.map((layer) => ({
            ...layer,
            systems: layer.systems?.map((sysEntry) => ({
              ...sysEntry,
              modules: (sysEntry.modules || []).map((mod) => ({
                ...mod,
                sectorIds: (mod.sectorIds || []).filter((id) => !removedIds.includes(id)),
              })),
            })),
          }))
        : d.layers;

      return { ...d, sectorsRegistry: newSectorsRegistry, layers };
    });
  }, []);

  const updateLayer = useCallback((layerId, newLayer) => {
    setData((d) => ({ ...d, layers: d.layers.map((l) => (l.id === layerId ? newLayer : l)) }));
  }, []);

  const deleteLayer = useCallback((layerId) => {
    if (!window.confirm("Remover esta camada?")) return;
    setData((d) => ({ ...d, layers: d.layers.filter((l) => l.id !== layerId) }));
  }, []);

  const addLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      number: "CAMADA X",
      title: "Nova Camada",
      desc: "Descrição",
      type: "l2",
      systems: [],
    };
    setData((d) => ({ ...d, layers: [newLayer, ...d.layers] }));
  };

  // DnD
  const findLayerBySystem = (systemId, layers) =>
    layers.find((l) => !l.isHub && l.systems?.some((s) => s.id === systemId));

  const handleDragStart = ({ active }) => {
    const layer = findLayerBySystem(active.id, data.layers);
    if (layer) setActiveSystem(layer.systems.find((s) => s.id === active.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveSystem(null);
    if (!over || active.id === over.id) return;
    const activeId = active.id;
    const overId = over.id;

    setData((d) => {
      const layers = d.layers;
      const sourceLayer = findLayerBySystem(activeId, layers);
      if (!sourceLayer) return d;

      const targetLayer =
        findLayerBySystem(overId, layers) ||
        layers.find((l) => l.id === overId && !l.isHub);
      if (!targetLayer) return d;

      if (sourceLayer.id === targetLayer.id) {
        const oldIndex = sourceLayer.systems.findIndex((s) => s.id === activeId);
        const newIndex = sourceLayer.systems.findIndex((s) => s.id === overId);
        if (oldIndex === newIndex) return d;
        const newSystems = arrayMove(sourceLayer.systems, oldIndex, newIndex);
        return {
          ...d,
          layers: layers.map((l) =>
            l.id === sourceLayer.id ? { ...l, systems: newSystems } : l
          ),
        };
      } else {
        const system = sourceLayer.systems.find((s) => s.id === activeId);
        const newSourceSystems = sourceLayer.systems.filter((s) => s.id !== activeId);
        let insertIndex = targetLayer.systems.findIndex((s) => s.id === overId);
        if (insertIndex === -1) insertIndex = targetLayer.systems.length;
        const newTargetSystems = [...targetLayer.systems];
        newTargetSystems.splice(insertIndex, 0, system);
        return {
          ...d,
          layers: layers.map((l) => {
            if (l.id === sourceLayer.id) return { ...l, systems: newSourceSystems };
            if (l.id === targetLayer.id) return { ...l, systems: newTargetSystems };
            return l;
          }),
        };
      }
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blueprint.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setData(migrateData(JSON.parse(ev.target.result))); }
      catch { alert("Arquivo JSON inválido."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (!window.confirm("Restaurar dados originais? Isso apagará todas as edições salvas.")) return;
    setData(initialData);
    clearFilters();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Toolbar
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
        sectorsRegistryOpen={sectorsRegistryOpen}
        onToggleSectorsRegistry={() => setSectorsRegistryOpen((o) => !o)}
      />

      {sectorsRegistryOpen && (
        <SectorsRegistry
          sectorsRegistry={sectorsRegistry}
          layers={data.layers}
          onUpdateSectorsRegistry={updateSectorsRegistry}
          onClose={() => setSectorsRegistryOpen(false)}
        />
      )}

      <div className="page" style={sectorsRegistryOpen ? { paddingRight: 356 } : {}}>
        <Header data={data.header} onChange={updateHeader} />

        <FilterSortBar
          sectorsRegistry={sectorsRegistry}
          activeSectorFilters={activeSectorFilters}
          onToggleSectorFilter={toggleSectorFilter}
          sort={sort}
          onSetSort={setSort}
          activeDevFilters={activeDevFilters}
          onToggleDevFilter={toggleDevFilter}
          onClear={clearFilters}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "#475569", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em" }}>LEGENDA:</span>
          {Object.values(DEV_STATUS).map((cfg) => (
            <div key={cfg.key} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 9, padding: "2px 8px", borderRadius: 3,
              fontFamily: "'IBM Plex Mono', monospace",
              background: `${cfg.color}12`, border: `1px solid ${cfg.color}40`, color: cfg.color,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
              {cfg.label}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <button
            onClick={addLayer}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1px dashed rgba(0,194,255,0.3)",
              background: "transparent", color: "#00c2ff",
              cursor: "pointer", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            + adicionar camada
          </button>
        </div>

        {visibleLayers.map((layer, i) => (
          <div key={layer.id}>
            <Layer
              layer={layer}
              sectorsRegistry={sectorsRegistry}
              isDragDisabled={isDragDisabled}
              onChange={(newLayer) => updateLayer(layer.id, newLayer)}
              onDelete={() => deleteLayer(layer.id)}
            />
            {i < visibleLayers.length - 1 && <div className="connector">↕</div>}
          </div>
        ))}

        <Footer data={data.footer} onChange={updateFooter} />
      </div>

      <DragOverlay>
        {activeSystem && (
          <div
            className="system-card"
            style={{ opacity: 0.85, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", cursor: "grabbing" }}
          >
            <div className="system-header">
              <div className="system-name">{activeSystem.name}</div>
              <span className="sys-vendor-mini">{activeSystem.vendor}</span>
            </div>
            {(activeSystem.modules || []).length > 0 && (
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", marginTop: 6 }}>
                {activeSystem.modules.length} módulo(s)
              </div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
