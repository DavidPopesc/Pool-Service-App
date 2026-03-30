interface props {
  id: string;
  label: string;
  value: string;
  onChange: (id: string, value: string) => void;
}

export default function NumberInput({ id, label, value, onChange }: props) {
  return (
    <label>
      {label}
      <input
        type="number"
        id={id}
        min="0"
        max="14"
        step="any"
        defaultValue={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </label>
  );
}
