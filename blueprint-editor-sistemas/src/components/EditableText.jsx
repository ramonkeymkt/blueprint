import { useState, useRef, useEffect } from "react";

export default function EditableText({ value, onChange, style, className, as: Tag = "span", multiline = false }) {
  const [isActive, setIsActive] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const ref = useRef(null);

  useEffect(() => { setLocalVal(value); }, [value]);
  useEffect(() => { if (isActive && ref.current) ref.current.focus(); }, [isActive]);

  const commit = (val) => {
    setIsActive(false);
    onChange(val);
  };

  if (!isActive) {
    return (
      <Tag
        style={{ cursor: "text", ...style }}
        className={className}
        onClick={() => setIsActive(true)}
        title="Clique para editar"
      >
        {value}
      </Tag>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => commit(localVal)}
        style={{
          background: "rgba(0,194,255,0.07)",
          border: "1px solid rgba(0,194,255,0.4)",
          borderRadius: 4,
          color: "inherit",
          font: "inherit",
          fontSize: "inherit",
          padding: "2px 6px",
          resize: "none",
          width: "100%",
          ...style,
        }}
        rows={2}
      />
    );
  }

  return (
    <input
      ref={ref}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => commit(localVal)}
      onKeyDown={(e) => { if (e.key === "Enter") commit(localVal); }}
      style={{
        background: "rgba(0,194,255,0.07)",
        border: "1px solid rgba(0,194,255,0.4)",
        borderRadius: 4,
        color: "inherit",
        font: "inherit",
        fontSize: "inherit",
        padding: "2px 6px",
        width: "100%",
        minWidth: 60,
        ...style,
      }}
      className={className}
    />
  );
}
