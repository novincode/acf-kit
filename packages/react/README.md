# @acf-kit/react

> **Headless, type-safe React bindings for [acf-kit/core](../core)**

---

## Why @acf-kit/react?

- **Headless & UI-agnostic:** Bring your own UI, design system, and layout.
- **TypeScript-first:** All hooks, context, and renderers are fully typed and infer your schema.
- **Composable:** Use hooks, context, and a flexible recursive renderer for any form structure.
- **Advanced Field Support:** Works with all core field types—group, repeater, flexible, and custom fields.
- **Maximum DX:** Ergonomic APIs, JSDoc, and full type inference for field values, errors, and configs.
- **Extensible:** Map any field type to your own React components, override rendering, and extend as needed.

---

## Installation

```sh
pnpm add @acf-kit/core @acf-kit/react react
# or
npm install @acf-kit/core @acf-kit/react react
# or
yarn add @acf-kit/core @acf-kit/react react
```

---

## Quick Start

```tsx
import {
  AcfFormProvider,
  AcfFormRenderer,
  FieldComponentMap,
  useAcfField
} from "@acf-kit/react";
import { Form } from "@acf-kit/core";
import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";

registerAllBuiltins();

const form = new Form({
  fields: [
    { name: "username", type: "text", required: true },
    { name: "age", type: "number" }
  ]
});

const mapping: FieldComponentMap = {
  text: ({ value, set }) => <input value={value || ""} onChange={e => set(e.target.value)} />,
  number: ({ value, set }) => <input type="number" value={value ?? ""} onChange={e => set(Number(e.target.value))} />,
};

export function MyForm() {
  return (
    <AcfFormProvider form={form}>
      <AcfFormRenderer form={form} mapping={mapping} />
    </AcfFormProvider>
  );
}
```

---

## Concepts & Architecture

- **Form Context:** Wrap your form in `AcfFormProvider` to provide context to all hooks and components.
- **Hooks:** Use `useAcfField` or `useAcfFields` for headless field logic, value, and error state.
- **Component Mapping:** Map field types (e.g. `text`, `select`) to your own React components for full UI control.
- **Renderer:** Use `AcfFormRenderer` for rapid prototyping, recursive/nested rendering, and layout control.
- **Custom Rendering:** Pass a `render` function or override any field’s rendering for maximum flexibility.
- **Full Support for Advanced Fields:** Group, repeater, and flexible fields are handled recursively and type-safely.

---

## API Reference

### `<AcfFormProvider form={form}>`
Wraps your form and provides context to all hooks/components.

### `useAcfField(fieldName)`
Headless hook for a single field. Returns value, setter, field instance, and error.

```tsx
const { value, set, field, error } = useAcfField("username");
```

### `useAcfFields(fieldNames)`
Headless hook for multiple fields at once. Returns an array of field states.

```tsx
const fields = useAcfFields(["username", "age"]);
fields[0].value; // value for "username"
```

### `<AcfFormRenderer />`
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

## Recipes & Usage

### Custom Field Components

```tsx
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
const { value, set } = useAcfField("profile"); // group field
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

## TypeScript & DX Tips

- All hooks and components are fully typed. Use generics for maximum type safety.
- Use `FieldComponentMap` and `RenderFieldConfig` for type-safe mapping and layout.
- Hover any exported symbol for instant JSDoc and type info in your editor.
- Use `useAcfField<YourSchema, "fieldName">("fieldName")` for advanced type inference.
- All field values, errors, and configs are type-safe and autocompleted.
- Works seamlessly with React 18+ and strict TypeScript settings.

---

## Example: Custom Field Components

```tsx
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

## Testing

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

## Roadmap

- More built-in field components for rapid prototyping
- Storybook and live examples
- More advanced type inference and DX helpers
- Recipes for integrating with design systems (MUI, Chakra, etc.)
- More docs and guides

---

## Support & Community

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
