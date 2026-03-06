import { DEV_STATUS } from "../data/devStatus";

const divider = <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />;

const sectionLabel = (text) => (
  <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
    {text}
  </span>
);

function Btn({ active, color, borderColor, bg, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 5,
        cursor: "pointer",
        fontFamily: "'IBM Plex Mono', monospace",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        border: active
          ? `1px solid ${borderColor || "rgba(0,194,255,0.6)"}`
          : "1px solid rgba(255,255,255,0.08)",
        background: active ? (bg || "rgba(0,194,255,0.12)") : "rgba(255,255,255,0.03)",
        color: active ? (color || "#00c2ff") : "#64748b",
      }}
    >
      {children}
    </button>
  );
}

export default function FilterSortBar({
  sectorsRegistry,
  activeSectorFilters,
  onToggleSectorFilter,
  sort,
  onSetSort,
  activeDevFilters,
  onToggleDevFilter,
  onClear,
}) {
  const hasActive = activeSectorFilters.length > 0 || activeDevFilters.length > 0 || sort !== null;
  const isDragDisabled = sort !== null || activeSectorFilters.length > 0 || activeDevFilters.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        marginBottom: 20,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        flexWrap: "wrap",
      }}
    >
      {/* Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {sectionLabel("Ordenar")}
        <Btn active={sort === "asc"}  onClick={() => onSetSort(sort === "asc"  ? null : "asc")}>A → Z</Btn>
        <Btn active={sort === "desc"} onClick={() => onSetSort(sort === "desc" ? null : "desc")}>Z → A</Btn>
      </div>

      {divider}

      {/* Filter by sector */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {sectionLabel("Setor")}
        {sectorsRegistry.map((sec) => (
          <Btn
            key={sec.id}
            active={activeSectorFilters.includes(sec.id)}
            onClick={() => onToggleSectorFilter(sec.id)}
          >
            {sec.name}
          </Btn>
        ))}
      </div>

      {divider}

      {/* Filter by dev status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {sectionLabel("Dev")}
        {Object.values(DEV_STATUS).map((cfg) => {
          const isActive = activeDevFilters.includes(cfg.key);
          return (
            <Btn
              key={cfg.key}
              active={isActive}
              color={cfg.color}
              borderColor={`${cfg.color}70`}
              bg={`${cfg.color}18`}
              onClick={() => onToggleDevFilter(cfg.key)}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? cfg.color : "#64748b", flexShrink: 0, boxShadow: isActive ? `0 0 4px ${cfg.color}` : "none" }} />
                {cfg.label}
              </span>
            </Btn>
          );
        })}
      </div>

      {/* Clear */}
      {hasActive && (
        <>
          {divider}
          <button
            onClick={onClear}
            style={{
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 5,
              cursor: "pointer",
              border: "1px solid rgba(255,107,43,0.3)",
              background: "rgba(255,107,43,0.06)",
              color: "#ff6b2b",
              fontFamily: "'IBM Plex Mono', monospace",
              flexShrink: 0,
            }}
          >
            ✕ limpar
          </button>
          {isDragDisabled && (
            <span style={{ fontSize: 10, color: "#374151", fontFamily: "'IBM Plex Mono', monospace" }}>
              · arrasto desativado
            </span>
          )}
        </>
      )}
    </div>
  );
}
