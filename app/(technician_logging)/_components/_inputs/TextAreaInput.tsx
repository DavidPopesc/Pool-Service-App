interface props {
  id: string;
  label: string;
  value: string;
  onChange: (id: string, value: string) => void;
}

export default function TextAreaInput({ id, label, value, onChange }: props) {
  return (
    <>
      <p>{label}</p>
      <p>
        <textarea
          id={id}
          onChange={(e) => onChange(id, e.target.value)}
          defaultValue={value}
        />
      </p>
    </>
  );
}
