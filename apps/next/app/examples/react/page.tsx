"use client";
import { useState } from "react";
import { Form } from "@acf-kit/core";
import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";
import {
  AcfFormProvider,
  AcfFormRenderer,
  FieldComponentMap,
  RenderFieldConfig,
  useAcfField,
} from "@acf-kit/react";
import type { FieldComponentProps } from "@acf-kit/react";

registerAllBuiltins();

function MyInput(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={value || ""}
        onChange={e => set(e.target.value)}
        placeholder={field?.config?.label || ""}
        style={{ width: "100%", padding: 8, border: error ? "1px solid red" : "1px solid #ccc", borderRadius: 4 }}
      />
      {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function MyNumber(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="number"
        value={value ?? ""}
        onChange={e => set(Number(e.target.value))}
        placeholder={field?.config?.label || ""}
        style={{ width: "100%", padding: 8, border: error ? "1px solid red" : "1px solid #ccc", borderRadius: 4 }}
      />
      {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function MyTextarea(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div style={{ marginBottom: 16 }}>
      <textarea
        value={value || ""}
        onChange={e => set(e.target.value)}
        placeholder={field?.config?.label || ""}
        style={{ width: "100%", padding: 8, minHeight: 60, border: error ? "1px solid red" : "1px solid #ccc", borderRadius: 4 }}
      />
      {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function UsernamePreview() {
  const { value } = useAcfField("username");
  if (!value) return null;
  return <div style={{ color: "#888", fontSize: 13 }}>Hello, <b>{value}</b> 👋</div>;
}

const mapping: FieldComponentMap = {
  text: MyInput,
  number: MyNumber,
  textarea: MyTextarea,
};

const form = new Form({
  fields: [
    { name: "username", type: "text", label: "Username", required: true },
    { name: "bio", type: "textarea", label: "Bio" },
    { name: "age", type: "number", label: "Age", validate: (v: number) => v < 0 ? "Negative age!" : undefined },
    {
      name: "profile",
      type: "group",
      label: "Profile",
      fields: [
        { name: "website", type: "text", label: "Website" },
        { name: "location", type: "text", label: "Location" },
      ],
    },
    {
      name: "tags",
      type: "repeater",
      label: "Tags",
      fields: [
        { name: "label", type: "text", label: "Tag Label" },
      ],
    },
    {
      name: "content",
      type: "flexible",
      label: "Content Blocks",
      layouts: [
        {
          name: "textBlock",
          label: "Text Block",
          fields: [
            { name: "text", type: "textarea", label: "Text" },
          ],
        },
        {
          name: "imageBlock",
          label: "Image Block",
          fields: [
            { name: "url", type: "text", label: "Image URL" },
          ],
        },
      ],
    },
  ],
});

export default function ReactAcfKitExample() {
  const [rerender, setRerender] = useState(0);
  const update = () => setRerender(x => x + 1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.validate()) {
      update();
      return;
    }
    alert("Form submitted!\n" + JSON.stringify(form.getValues(), null, 2));
  };

  return (
    <AcfFormProvider form={form}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "2rem auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>🚀 acf-kit/react Example Form</h2>
        <UsernamePreview />
        <AcfFormRenderer
          form={form}
          mapping={mapping}
          wrapper={(field: React.ReactNode, config: RenderFieldConfig) => (
            <div key={config.name} style={{ marginBottom: 20 }}>{field}</div>
          )}
        />
        <button type="submit" style={{ marginTop: 24, padding: "10px 24px", borderRadius: 4, background: "#222", color: "#fff", border: 0, fontWeight: 600 }}>
          Submit
        </button>
      </form>
    </AcfFormProvider>
  );
}
