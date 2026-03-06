import EditableText from "./EditableText";

export default function Header({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="header">
      <div className="header-left">
        <div className="tag">
          <EditableText value={data.version} onChange={set("version")} />
        </div>
        <h1>
          <EditableText value={data.title} onChange={set("title")} />
          <br />
          <span>
            <EditableText value={data.titleHighlight} onChange={set("titleHighlight")} />
          </span>
        </h1>
      </div>
      <div className="header-right">
        <div className="date">
          <EditableText value={data.date} onChange={set("date")} />
        </div>
        <div className="status-badge">
          <EditableText value={data.status} onChange={set("status")} />
        </div>
      </div>
    </div>
  );
}
