"use client";

import React, { useRef, useState } from "react";
import PoolTechnicianFormInput from "../_components/PoolTechnicianFormInput";

interface InputField {
  id: string;
  type: string;
  label: string;
  value: string;
}

export default function PoolTechnicianForm() {
  const [devInput, setDevInput] = useState<InputField>({
    id: "devInput",
    type: "text-area",
    label: "Input JSON string template: ",
    value: "",
  });

  const handleDevInputChange = (id: string, value: string) => {
    setDevInput({ ...devInput, value });
  };

  const handleDevSubmit = () => {
    const template: string = devInput.value;
    console.log("Template being parsed: ", template);
    constructForm(template);
  };

  const [inputFields, setInputFields] = useState<InputField[]>([]);

  const handleInputChange = (id: string, value: string) => {
    setInputFields((prevFields) =>
      //makes a new array out of the old array, but replaces the value of the changed field with the new value
      prevFields.map((field) =>
        field.id === id ? { ...field, value } : field,
      ),
    );
  };

  const handleGetValues = () => {
    const allValues = inputFields.map((input) => ({
      type: input.type,
      label: input.label,
      value: input.value,
    }));

    return JSON.stringify(allValues);
  };

  const constructForm = (template: string) => {
    console.log(template);
    const templateJson = JSON.parse(template.trim());
    setInputFields(
      templateJson.map((field: { type: string; label: string }) => ({
        id: crypto.randomUUID(),
        type: field.type,
        label: field.label,
        value: "",
      })),
    );
  };

  const submitButton = () => {
    // Until we get database functionality, this function spits out the json blob to the alert
    alert(handleGetValues());
  };

  return (
    <>
      {/* Dev input for template data */}
      <PoolTechnicianFormInput
        id={devInput.id}
        type={devInput.type}
        label={devInput.label}
        value={devInput.value}
        onChange={handleDevInputChange}
      />
      <button onClick={() => handleDevSubmit()}>Submit Template</button>

      {/* Display all template fields */}
      {inputFields.map((field) => (
        <div key={field.id}>
          <PoolTechnicianFormInput
            id={field.id}
            type={field.type}
            label={field.label}
            value={field.value}
            onChange={handleInputChange}
          />
        </div>
      ))}

      <button onClick={() => submitButton()}>Submit Form</button>
    </>
  );
}
