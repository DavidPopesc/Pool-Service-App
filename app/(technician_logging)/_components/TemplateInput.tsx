interface InputProps {
    id: string;
    type: string;
    value: string;
    onChangeFunction: (id: string, value: string) => void;
    onRemove?: (id: string) => void;
}

const TemplateInput = ({ id, type, value, onChangeFunction, onRemove }: InputProps) => {
    return <label>
        Label for {type} element:
        <input type="text"
        value={value}
        onChange={(e) => onChangeFunction(id, e.target.value)}
        />
        {onRemove && (
            <button onClick={() => onRemove(id)} type="button">
                Remove
            </button>
        )}
    </label>
}

export default TemplateInput;