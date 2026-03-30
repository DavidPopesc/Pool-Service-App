interface props {
  id: string;
  label: string;
  value: string;
  onChange: (id: string, value: string) => void;
}

export default function TextInput({ id, label, value, onChange }: props) {
  return (
    <label>
      {label}
      <input
        type="text"
        id={id}
        onChange={(e) => onChange(id, e.target.value)}
        value={value}
      />
    </label>
  );
}
