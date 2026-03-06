import EditableText from "./EditableText";

export default function Footer({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="footer">
      <div className="footer-note">
        <EditableText value={data.note} onChange={set("note")} />
      </div>
      <div className="next-step">
        <EditableText value={data.nextStep} onChange={set("nextStep")} />
      </div>
    </div>
  );
}
