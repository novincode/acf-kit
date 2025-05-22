'use client'
import Image from "next/image";
import { Form } from "@acf-kit/core";

import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";
import { useState } from "react";

registerAllBuiltins();

export default function Home() {
  // Register built-in field types if needed (see README)
  // import { registerAllBuiltins } from '@acf-kit/core/fields/builtins';
  // registerAllBuiltins();

  // Create a simple form instance
  const [form] = useState(() => new Form({
    fields: [
      { name: "username", type: "text", required: true },
      { name: "age", type: "number", validate: v => v < 0 ? "Negative age!" : undefined }
    ]
  }));
  const [_, setRerender] = useState(0);

  // Helper to force rerender
  const update = () => setRerender(x => x + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.validate()) {
      update();
      return;
    }
    alert(JSON.stringify(form.getValues(), null, 2));
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto" }}>
      <div style={{ marginBottom: 16 }}>
        <label>
          Username:
          <input
            type="text"
            value={form.getValue("username") || ""}
            onChange={e => { form.setValue("username", e.target.value); update(); }}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        {form.getErrors().username && (
          <div style={{ color: "red" }}>{form.getErrors().username}</div>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Age:
          <input
            type="number"
            value={form.getValue("age") || ""}
            onChange={e => { form.setValue("age", Number(e.target.value)); update(); }}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        {form.getErrors().age && (
          <div style={{ color: "red" }}>{form.getErrors().age}</div>
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
