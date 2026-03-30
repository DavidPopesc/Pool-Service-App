import TextInput from "./_inputs/TextInput";

interface InputProps {
  id: string;
  type: string;
  value: string;
  onChangeFunction: (id: string, value: string) => void;
  onRemove?: (id: string) => void;
}

const TemplateInput = ({
  id,
  type,
  value,
  onChangeFunction,
  onRemove,
}: InputProps) => {
  const label = `Label for ${type} element`;
  return (
    <TextInput
      id={id}
      value={value}
      label={label}
      onChange={onChangeFunction}
    />
  );
};

export default TemplateInput;
