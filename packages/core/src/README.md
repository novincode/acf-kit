# acf-kit/core

## What is this?

A headless, type-safe, extensible field & form engine for modern web frameworks.  
- **Minimal & Modular.**
- **Type-safe, best-practice architecture.**
- **Plugin-first, with registry and event emitter.**

## Key Concepts

- **Fields:** Typed, extensible, pluggable.  
- **Forms:** Collection of fields, validation, errors.
- **Plugins:** Add/override fields, validation, behaviors.
- **Events:** Lifecycle hooks via event emitter.

## Usage Example

```ts
import { Form } from "./core";
import "./core/fields/builtins"; // Register built-in fields

const form = new Form({
  fields: [
    { name: "username", type: "text", required: true },
    { name: "age", type: "number", validate: v => v < 0 ? "Negative age!" : undefined }
  ]
});

form.setValue("username", "John");
form.setValue("age", 42);

if (!form.validate()) {
  console.log(form.getErrors());
}
```

## Contributing

- Keep all code type-safe and minimal.
- Add new field types or plugins via registration.
- Extend, don't hack—use the registry and event emitter.
