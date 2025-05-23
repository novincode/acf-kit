# acf-kit/core

> **A fully type-safe, extensible, headless field & form engine for modern web frameworks.**

---

## Why acf-kit/core?

- **TypeScript-first:** All field configs, values, and errors are strictly typed. No more `any` or `unknown` in your app code—get full type inference everywhere.
- **Composable & Extensible:** Register custom field types, plugins, and validation logic. Compose arbitrarily deep/nested forms with confidence.
- **Advanced Field Types:** Supports primitives, group, repeater, and flexible content fields—each with ergonomic, type-safe APIs.
- **Framework Agnostic:** Use with React, Vue, Svelte, or any UI—no UI or framework lock-in.
- **Minimal & Modular:** Tree-shakable, zero dependencies, and only core logic. Bring your own UI.
- **Plugin-First Architecture:** Registry and event emitter for easy extension and advanced use cases.
- **DX First:** JSDoc, error codes, and a plugin-first architecture for a seamless developer experience. All error codes and constants are exported for programmatic use.

---

## Installation

```sh
pnpm add @acf-kit/core
# or
npm install @acf-kit/core
# or
yarn add @acf-kit/core
```

---

## Quick Start

```ts
import { Form } from "@acf-kit/core";
import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";

registerAllBuiltins();

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

---

## Core Concepts

### Fields
- **Primitive fields:** `text`, `number`, `boolean`, `date`, `textarea`.
- **Group:** Nested object fields (like a sub-form).
- **Repeater:** Array of fieldsets (repeatable groups).
- **Flexible:** Array of heterogeneous layouts (dynamic blocks, like CMS flexible content).
- **Custom fields:** Register your own types with full type safety.

### Forms
- A form is a collection of fields, with methods for value access, validation, and conditional logic.
- All values, errors, and configs are fully typed and inferred.

### Plugins & Registry
- Register new field types, plugins, or validation logic.
- Use the event emitter for advanced extension and lifecycle hooks.

---

## Type-Safe Field System

### Defining Fields

Use the ergonomic `createFields` utility for deeply type-safe field definitions:

```ts
import { createFields } from "@acf-kit/core/fields/types";

const fields = createFields<{ username: string; age: number }>()([
  { name: "username", type: "text", required: true },
  { name: "age", type: "number" }
]);
```

### Advanced/Nested Fields Example

```ts
const fields = createFields<MyValues>()([
  { name: "username", type: "text" },
  {
    name: "profile",
    type: "group",
    fields: createFields<MyValues["profile"]>()([
      { name: "website", type: "text" },
      { name: "location", type: "text" }
    ])
  },
  {
    name: "tags",
    type: "repeater",
    fields: createFields<MyValues["tags"][number]>()([
      { name: "label", type: "text" }
    ])
  },
  {
    name: "content",
    type: "flexible",
    layouts: [
      {
        name: "textBlock",
        label: "Text Block",
        fields: createFields<{ text: string }>()([
          { name: "text", type: "textarea" }
        ])
      },
      {
        name: "imageBlock",
        label: "Image Block",
        fields: createFields<{ url: string }>()([
          { name: "url", type: "text" }
        ])
      }
    ]
  }
]);
```

---

## API Reference

### Form

```ts
new Form<TValues>({ fields })
```

#### Methods
- `setValue(name: string, value: any)`: Set a field's value.
- `getValue(name: string)`: Get a field's value.
- `getValues()`: Get all field values as a record (fully typed).
- `validate()`: Run synchronous validation, returns `true` if valid.
- `validateAsync()`: Run async validation, returns error map.
- `getErrors()`: Get current error map.
- `isFieldVisible(name: string)`: Check if a field is visible (based on `visibleIf`).
- `isFieldEnabled(name: string)`: Check if a field is enabled (based on `enabledIf`).
- `getVisibleFields()`: Get all visible fields.
- `getEnabledFields()`: Get all enabled fields.
- `on(event, cb)`: Subscribe to form events (field:change, field:error, etc).
- `off(event, cb)`: Unsubscribe from form events.

### Field

- `setValue(value)`: Set the field value.
- `getValue()`: Get the field value.
- `validateAsync(values)`: Async validation for the field.
- `onChange(cb)`: Subscribe to field value changes.
- `offChange(cb)`: Unsubscribe from field value changes.

---

## Extending & Plugins

Register new field types, plugins, or validation logic:

```ts
import { registerFieldType } from "@acf-kit/core/fields/registry";
import { Field } from "@acf-kit/core/fields/fieldBase";

registerFieldType("color", (config) => {
  // ...return a Field instance
});
```

You can also extend the type system via declaration merging for custom field types:

```ts
declare module '@acf-kit/core/fields/types' {
  interface FieldTypeMap { color: string; }
}
```

---

## Error Handling

All errors are instances of custom error classes with error codes:

- `AcfKitError` — Base error for all acf-kit/core logic.
- `FieldTypeError` — Thrown when a field type is not registered or invalid.
- `FormConfigError` — Thrown when a form has invalid configuration.

Error codes are exported from `constants.ts` for programmatic use.

---

## TypeScript & DX Tips

- **Full Inference:** All APIs are fully typed. Use TypeScript's type inference for field values, errors, and configs.
- **Generics:** Use `FieldConfig<T>` and `Form<T>` generics for maximum type safety in custom field and form definitions.
- **Declaration Merging:** Extend the type system for custom field types via module augmentation.
- **JSDoc:** All public APIs are documented with JSDoc for in-editor help.
- **Error Codes:** All error codes and constants are exported for programmatic use.
- **No UI Lock-in:** Use with any UI framework or headless—bring your own components.

---

## Recipes

### Conditional Logic

```ts
{ name: "bio", type: "textarea", visibleIf: values => !!values.username }
```

### Custom Validation

```ts
{ name: "age", type: "number", validate: v => v < 0 ? "Negative age!" : undefined }
```

### Deeply Nested Forms

Use group, repeater, and flexible fields for arbitrarily nested/dynamic structures.

### Async Validation

```ts
{ name: "email", type: "text", validate: async (v) => await checkEmail(v) ? undefined : "Email taken" }
```

### Plugin Example: Registering a Custom Field

```ts
import { registerFieldType } from "@acf-kit/core/fields/registry";
import { Field } from "@acf-kit/core/fields/fieldBase";

registerFieldType("color", (config) => new Field(config));
```

---

## FAQ

**Q: Can I use this with React, Vue, Svelte, or plain JS?**
> Yes! acf-kit/core is UI-agnostic. Use it with any UI or framework.

**Q: Is it really type-safe for deeply nested/complex forms?**
> Yes! All field values, configs, and errors are deeply inferred and type-checked.

**Q: How do I add my own field type?**
> Use `registerFieldType` and (optionally) extend the type system via module augmentation.

**Q: Does it support async validation?**
> Yes! Use `validateAsync` on fields or forms for async validation logic.

**Q: Is it production-ready?**
> Yes! The core is stable, tested, and used in real projects.

---

## License

MIT

---

## Credits

Inspired by ACF, Formik, and modern headless CMSs. Built with ❤️ by the acf-kit team and contributors.
