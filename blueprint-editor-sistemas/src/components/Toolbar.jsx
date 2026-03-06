const tbtn = (color = "#64748b", borderColor = "rgba(255,255,255,0.1)", bg = "rgba(255,255,255,0.04)") => ({
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${borderColor}`,
  background: bg,
  color,
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
});

export default function Toolbar({ onExport, onImport, onReset, sectorsRegistryOpen, onToggleSectorsRegistry }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        gap: 8,
        zIndex: 100,
        background: "rgba(10,14,26,0.92)",
        border: "1px solid rgba(0,194,255,0.2)",
        borderRadius: 10,
        padding: "8px 12px",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        onClick={onToggleSectorsRegistry}
        style={tbtn(
          sectorsRegistryOpen ? "#00c2ff" : "#64748b",
          sectorsRegistryOpen ? "rgba(0,194,255,0.4)" : "rgba(255,255,255,0.1)",
          sectorsRegistryOpen ? "rgba(0,194,255,0.1)" : "rgba(255,255,255,0.04)"
        )}
        title="Cadastro de setores"
      >
        ⊟ Setores
      </button>

      <button onClick={onExport} title="Exportar JSON" style={tbtn()}>↓ Export</button>

      <label title="Importar JSON" style={{ ...tbtn(), display: "flex", alignItems: "center" }}>
        ↑ Import
        <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
      </label>

      <button
        onClick={onReset}
        title="Restaurar dados originais"
        style={tbtn("#ff6b2b", "rgba(255,107,43,0.2)", "rgba(255,107,43,0.06)")}
      >
        ↺ Reset
      </button>
    </div>
  );
}
