import TextAreaInput from "./_inputs/TextAreaInput";
import TextInput from "./_inputs/TextInput";
import NumberInput from "./_inputs/NumberInput";

interface InputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (id: string, value: string) => void;
}

const PoolTechnicianFormInput = ({
  id,
  type,
  label,
  value,
  onChange,
}: InputProps) => {
  switch (type) {
    case "text-area":
      return (
        <TextAreaInput
          id={id}
          value={value}
          label={label}
          onChange={onChange}
        />
      );
    case "text":
      return (
        <TextInput id={id} value={value} label={label} onChange={onChange} />
      );
    case "number":
      return (
        <NumberInput id={id} value={value} label={label} onChange={onChange} />
      );
  }
};

export default PoolTechnicianFormInput;
