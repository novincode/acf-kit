# acf-kit 🚀

> **A fully type-safe, extensible, headless field & form engine for modern web frameworks.**

---

## 📦 Packages

### [`@acf-kit/core`](./packages/core)
- 🧠 **Type-safe, extensible, headless form and field engine**
- 🏗️ Advanced field types: primitives, group, repeater, flexible, and custom
- 🪶 Framework-agnostic, zero dependencies, plugin-first architecture
- 📖 [Read the core README →](./packages/core/README.md)

### [`@acf-kit/react`](./packages/react)
- ⚛️ **Headless, type-safe React bindings for acf-kit/core**
- 🪢 Hooks, context, recursive renderer, and full support for advanced fields
- 🎨 Bring your own UI, design system, and layout
- 📖 [Read the react README →](./packages/react/README.md)

---

## ✨ Features

- 🟦 **TypeScript-first:** All configs, values, and errors are strictly typed. No more `any` or `unknown` in your app code—get full type inference everywhere.
- 🧩 **Composable & Extensible:** Register custom field types, plugins, and validation logic. Compose arbitrarily deep/nested forms with confidence.
- 🏗️ **Advanced Field Types:** Supports primitives, group, repeater, and flexible content fields—each with ergonomic, type-safe APIs.
- 🪶 **Framework Agnostic:** Use with React, Vue, Svelte, or any UI—no UI or framework lock-in.
- 🪶 **Minimal & Modular:** Tree-shakable, zero dependencies, and only core logic. Bring your own UI.
- 🔌 **Plugin-First Architecture:** Registry and event emitter for easy extension and advanced use cases.
- 💚 **DX First:** JSDoc, error codes, and a plugin-first architecture for a seamless developer experience.

---

## 🚀 Getting Started

### 📥 Install

```sh
pnpm add @acf-kit/core @acf-kit/react react
# or
npm install @acf-kit/core @acf-kit/react react
# or
yarn add @acf-kit/core @acf-kit/react react
```

### ⚡ Quick Example

```tsx
import { Form } from "@acf-kit/core";
import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";
import { AcfFormProvider, AcfFormRenderer } from "@acf-kit/react";

registerAllBuiltins();

const form = new Form({
  fields: [
    { name: "username", type: "text", required: true },
    { name: "age", type: "number" }
  ]
});

const mapping = {
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

## 🗂️ Monorepo Structure

- `packages/core` — 🧠 The type-safe, extensible form engine
- `packages/react` — ⚛️ React bindings, hooks, and renderer
- `apps/` — 🧪 Example/demo apps (see Next.js example)
- `scripts/` — 🛠️ Dev and publishing scripts

---

## 🤝 Contributing

We welcome contributions! Please see the [contributing guide](./packages/core/CONTRIBUTING.md) for details on how to get involved, report bugs, or suggest features.

- 💬 Open issues or discussions for questions, bugs, or ideas
- 🔧 PRs are welcome for bugfixes, features, and docs
- 🧑‍💻 All code is TypeScript-first and tested

---

## 📚 Learn More

- [Core package docs](./packages/core/README.md)
- [React package docs](./packages/react/README.md)
- [Examples (Next.js, shadcn/ui, etc.)](./apps/next/app/examples/)

---

## 🪪 License

MIT

---

## 🙏 Credits

- Built with ❤️ by the acf-kit team and contributors.
- Inspired by [Advanced Custom Fields](https://www.advancedcustomfields.com/), [Formik](https://formik.org/), and modern headless CMSs.
