# @acf-kit/react

[![npm version](https://img.shields.io/npm/v/@acf-kit/react.svg)](https://npmjs.com/package/@acf-kit/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](../core/LICENSE)

---

Headless, type-safe React bindings for [acf-kit/core](../core)

---

## 📚 Table of Contents

- [✨ Introduction](#-introduction)
- [🌟 Features](#-features)
- [⬇️ Installation](#-installation)
- [⚡ Quick Start](#-quick-start)
- [🏗️ Concepts & Architecture](#-concepts--architecture)
- [🧩 API Reference](#-api-reference)
- [🧑‍🍳 Recipes & Usage](#-recipes--usage)
- [💡 TypeScript & DX Tips](#-typescript--dx-tips)
- [🖼️ Example: Custom Field Components](#-example-custom-field-components)
- [🧪 Testing](#-testing)
- [🗺️ Roadmap](#-roadmap)
- [🌍 Support & Community](#-support--community)

---

## ✨ Introduction

`@acf-kit/react` provides headless, type-safe, and composable React bindings for [`acf-kit/core`](../core). It lets you build fully custom, ergonomic, and type-safe forms in React, powered by the robust logic and validation of the core engine.

- **Headless**: Bring your own UI, layout, and design system.
- **Composable**: Use hooks, context, and a flexible renderer for any form structure.
- **Type-safe**: All hooks and components are fully typed for maximum DX.
- **Extensible**: Map any field type to your own React components.

---

## 🌟 Features

- Headless hooks for field logic (`useAcfField`, `useAcfFields`)
- Context provider for form state (`AcfFormProvider`)
- Flexible, recursive renderer (`AcfFormRenderer`) for rapid prototyping or production
- Component mapping for custom UIs and field types
- Full support for nested, repeater, group, and flexible fields
- Live field updates via event emitter
- Maximum DX: pass custom field objects, layout, styles, and even override rendering
- Fully typed API, powered by acf-kit/core

---

## ⬇️ Installation

```bash
pnpm add @acf-kit/core @acf-kit/react react
# or
npm install @acf-kit/core @acf-kit/react react
# or
yarn add @acf-kit/core @acf-kit/react react
```

---

## ⚡ Quick Start

```tsx
import {
  AcfFormProvider,
  AcfFormRenderer,
  FieldComponentMap,
  RenderFieldConfig
} from "@acf-kit/react";
import { MyInput, MySelect } from "./fields";
import { form } from "./myFormInstance";

// 1. Map field types to React components
const mapping: FieldComponentMap = {
  text: MyInput,
  select: MySelect,
};

// 2. Describe your fields and layout
const fields: RenderFieldConfig[] = [
  { name: "title", label: "Title", width: "100%", className: "title" },
  { name: "type", label: "Type", width: "50%", className: "type" },
  {
    name: "description",
    label: "Description",
    width: "50%",
    render: ({ value, set }) => (
      <textarea value={value || ""} onChange={e => set(e.target.value)} />
    ),
  },
];

// 3. Render the form
export function MyForm() {
  return (
    <AcfFormProvider form={form}>
      <div className="grid grid-cols-12 gap-4">
        <AcfFormRenderer
          form={form}
          mapping={mapping}
          fields={fields}
          wrapper={(field, config) => (
            <div
              key={config.name}
              style={{ gridColumn: `span ${config.width === "50%" ? 6 : 12}` }}
              className={config.className}
            >
              {field}
            </div>
          )}
        />
      </div>
    </AcfFormProvider>
  );
}
```

---

## 🏗️ Concepts & Architecture

- **Form Context**: Wrap your form in `AcfFormProvider` to provide context to all hooks and components.
- **Hooks**: Use `useAcfField` or `useAcfFields` for headless field logic, value, and error state.
- **Component Mapping**: Map field types (e.g. `text`, `select`) to your own React components for full UI control.
- **Renderer**: Use `AcfFormRenderer` for rapid prototyping, recursive/nested rendering, and layout control.
- **Custom Rendering**: Pass a `render` function or override any field’s rendering for maximum flexibility.

---

## 🧩 API Reference

### `AcfFormProvider`
Wraps your form and provides context to all hooks/components.

```tsx
<AcfFormProvider form={form}>
  {/* ... */}
</AcfFormProvider>
```

### `useAcfField(fieldName)`
Headless hook for a single field. Returns value, setter, field instance, and error.

```tsx
const { value, set, field, error } = useAcfField("title");
```

### `useAcfFields(fieldNames)`
Headless hook for multiple fields at once. Returns an array of field states.

```tsx
const fields = useAcfFields(["title", "type"]);
fields[0].value; // value for "title"
```

### `AcfFormRenderer`
Flexible, recursive renderer for forms. Handles nested, group, repeater, and flexible fields.

Props:
- `form`: The form instance
- `mapping`: Field type to component map
- `fields`: (optional) Array of field names or config objects
- `wrapper`: (optional) Function to wrap each field node

### `FieldComponentMap`
Type for mapping field types (e.g. `text`, `select`) to React components.

### `RenderFieldConfig`
Type for field-level layout and rendering config. Supports custom renderers, layout, and style props.

---

## 🧑‍🍳 Recipes & Usage

### Custom Field Components

```tsx
// MyInput.tsx
export function MyInput({ value, set, error }) {
  return (
    <div>
      <input value={value || ""} onChange={e => set(e.target.value)} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### Nested/Repeater/Group Fields

`AcfFormRenderer` automatically handles group, repeater, and flexible fields recursively. You can also use hooks directly for custom rendering:

```tsx
const { value, set } = useAcfField("seo"); // group field
// value is an object of nested values
```

### Custom Layouts & Wrappers

Use the `wrapper` prop to control layout, grid, or add custom wrappers:

```tsx
<AcfFormRenderer
  form={form}
  mapping={mapping}
  wrapper={(field, config) => (
    <div className={config.className}>{field}</div>
  )}
/>
```

### Advanced: Custom Renderers

Override rendering for any field with the `render` prop in `RenderFieldConfig`:

```tsx
const fields = [
  {
    name: "description",
    render: ({ value, set }) => (
      <textarea value={value} onChange={e => set(e.target.value)} />
    ),
  },
];
```

---

## 💡 TypeScript & DX Tips

- All hooks and components are fully typed. Use generics for maximum type safety.
- Use `FieldComponentMap` and `RenderFieldConfig` for type-safe mapping and layout.
- Hover any exported symbol for instant JSDoc and type info in your editor.
- Use `useAcfField<YourSchema, "fieldName">("fieldName")` for advanced type inference.
- All field values, errors, and configs are type-safe and autocompleted.

---

## 🖼️ Example: Custom Field Components

```tsx
// MySelect.tsx
export function MySelect({ value, set, error, field }) {
  return (
    <div>
      <select value={value} onChange={e => set(e.target.value)}>
        {field.options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

## 🧪 Testing

- All logic is headless and easily testable with Jest, Vitest, or your favorite runner.
- Example:

```ts
import { renderHook, act } from "@testing-library/react";
import { AcfFormProvider, useAcfField } from "@acf-kit/react";

// ...setup form and provider...

const { result } = renderHook(() => useAcfField("title"), {
  wrapper: ({ children }) => <AcfFormProvider form={form}>{children}</AcfFormProvider>
});

act(() => result.current.set("Hello"));
expect(result.current.value).toBe("Hello");
```

---

## 🗺️ Roadmap

- More built-in field components for rapid prototyping
- Storybook and live examples
- More advanced type inference and DX helpers
- Recipes for integrating with design systems (MUI, Chakra, etc.)
- More docs and guides

---

## 🌍 Support & Community

- [GitHub Issues](https://github.com/novincode/acf-kit/issues) — Bug reports & feature requests
- [Discussions](https://github.com/novincode/acf-kit/discussions) — Ask questions, share ideas
- [Contributing Guide](../core/CONTRIBUTING.md) — How to get involved

---

## License

MIT

---

## Credits

- Built with ❤️ by the acf-kit team and contributors.
- Inspired by [Advanced Custom Fields](https://www.advancedcustomfields.com/), [Formik](https://formik.org/), and modern headless CMSs.
