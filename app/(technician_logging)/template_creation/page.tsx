'use client';

import React, {useState} from 'react';

import TemplateInput from "../_components/TemplateInput";

interface TemplateField {
    id: string;
    type: string;
    value: string;
}

export default function TemplateCreation() {

    const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);

    const [newFieldType, setNewFieldType] = useState("text");

    // function assigns templateFields to a new array made of templateFields + a new templateField object
    const addNewField = (format:string) => {
        const newField: TemplateField = {
            id: crypto.randomUUID(), //generate an inconsequential id
            type: format, //the type of entry on the technician form, NOT ON THE TEMPLATE CREATOR
            value: '',
        };
        setTemplateFields([...templateFields, newField]);
    };

    // Detects the changes in the dropdown
    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setNewFieldType(event.target.value);
    }

    const handleInputChange = (id: string, value: string) => {
        setTemplateFields(prevFields =>
            //makes a new array out of the old array, but replaces the value of the changed field with the new value
            prevFields.map(field=>
                field.id === id ? {...field, value} : field
            )
        );
    };

    const handleRemoveField = (id: string) => {
        setTemplateFields(prevFields => prevFields.filter(field => field.id !== id));
    };

    // Get all values
    const handleGetValue = () => {
        const allValues = templateFields.map(field => ({
            type: field.type,
            label: field.value
        }));
        console.log('All template values:', allValues);
        return JSON.stringify(allValues);
    };

    const submitButton = () => {
        // Until we get database functionality, this function spits out the json blob to the alert
        alert(handleGetValue());
    }

  return <>
    <h1>Template Creation</h1>

    {/* Add Field Button */}
    <p>
        <select name="input-types" id="input-types" onChange={handleTypeChange}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="text-area">Text Area</option>
        </select>
        <button onClick={()=> addNewField(newFieldType)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', color: "purple" }}>
            Add Template Field
        </button>
    </p>
    
    {/* Display all template fields */}
            {templateFields.map(field => (
                <div key={field.id}>  
                    <TemplateInput
                        id={field.id}
                        type={field.type}
                        value={field.value}
                        onChangeFunction={handleInputChange}
                        onRemove={handleRemoveField}
                    />
                </div>
            ))}
    
    {/* Button to flush out the values */}
    <button onClick={submitButton} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', color: "purple" }}>
            Submit
    </button>
  </>
}