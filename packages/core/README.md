[![npm version](https://img.shields.io/npm/v/@acf-kit/core.svg)](https://npmjs.com/package/@acf-kit/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Concepts & Architecture](#concepts--architecture)
- [Field Types](#field-types)
- [API Reference](#api-reference)
- [Extending & Plugins](#extending--plugins)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Best Practices & Recipes](#best-practices--recipes)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [TypeScript & DX Tips](#typescript--dx-tips)
- [UI Framework Recipes](#ui-framework-recipes)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Support & Community](#support--community)

---

## Introduction

`acf-kit/core` is a modern, framework-agnostic engine for building dynamic, type-safe forms and field systems. Inspired by the best of ACF, Formik, and headless CMSs, it’s designed for:

- **Type safety**: All field values, configs, and errors are fully typed.
- **Extensibility**: Register new field types, validation, and plugins with ease.
- **Minimalism**: Only core logic, no UI or framework lock-in.
- **DX First**: JSDoc, error codes, and a plugin-first architecture for a seamless developer experience.

Whether you’re building a CMS, a form builder, or a custom admin, `acf-kit/core` gives you the foundation for robust, maintainable, and scalable forms.

---

## Features

- **Type-safe field and form engine**: Built with TypeScript for maximum safety and DX.
- **Minimal & Modular**: Tree-shakable, import only what you need.
- **Extensible**: Register custom field types, plugins, and validation logic.
- **Plugin-first architecture**: Registry and event emitter for easy extension.
- **Advanced fields**: Supports repeater, group, flexible content, and more.
- **Centralized constants & error codes**: For robust, programmatic error handling.
- **JSDoc everywhere**: For best-in-class developer experience.

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

// Register built-in field types (text, number, boolean, etc.)
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

## Concepts & Architecture

- **Fields**: Each field is a type-safe, extensible unit. Built-in types include text, number, boolean, date, repeater, group, and flexible. Custom types can be registered.
- **Forms**: A form is a collection of fields, with methods for value access, validation, and conditional logic.
- **Plugins**: Extend or override field types, validation, or behaviors via the registry and event emitter.
- **Events**: Lifecycle hooks for field and form events.
- **Constants & Error Codes**: All magic strings and error codes are centralized for maintainability.

---

## Field Types

`acf-kit/core` comes with a rich set of built-in field types, all fully type-safe and extensible. You can also register your own custom field types.

### Built-in Field Types

- **text**: Single-line string input.
  ```ts
  { name: "title", type: "text", required: true }
  ```
- **number**: Numeric input (integer or float).
  ```ts
  { name: "price", type: "number", min: 0 }
  ```
- **boolean**: Checkbox or toggle.
  ```ts
  { name: "isActive", type: "boolean" }
  ```
- **date**: Date picker.
  ```ts
  { name: "publishedAt", type: "date" }
  ```
- **select**: Dropdown/select with options.
  ```ts
  { name: "status", type: "select", options: [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" }
  ]}
  ```
- **radio**: Radio button group.
  ```ts
  { name: "gender", type: "radio", options: [
    { label: "Male", value: "m" },
    { label: "Female", value: "f" }
  ]}
  ```
- **repeater**: Dynamic array of fields (fieldset array).
  ```ts
  { name: "tags", type: "repeater", fields: [
    { name: "label", type: "text" }
  ]}
  ```
- **group**: Nested group of fields (object value).
  ```ts
  { name: "seo", type: "group", fields: [
    { name: "title", type: "text" },
    { name: "description", type: "text" }
  ]}
  ```
- **flexible**: Flexible content (array of different layouts).
  ```ts
  { name: "content", type: "flexible", layouts: [
    { name: "textBlock", fields: [ { name: "text", type: "text" } ] },
    { name: "imageBlock", fields: [ { name: "url", type: "text" } ] }
  ]}
  ```

### Custom Field Types

You can register your own field types for custom UI or logic:

```ts
import { registerFieldType } from "@acf-kit/core/fields/registry";

registerFieldType("color", {
  // ...field config, value shape, validation, etc.
});
```

Once registered, use your custom field type in any form config:

```ts
{ name: "favoriteColor", type: "color" }
```

---

## API Reference

### Form

```ts
new Form(config: FormConfig)
```

- `setValue(name: string, value: any)`: Set a field's value.
- `getValue(name: string)`: Get a field's value.
- `getValues()`: Get all field values as a record.
- `validate()`: Run synchronous validation, returns `true` if valid.
- `validateAsync()`: Run async validation, returns error map.
- `getErrors()`: Get current error map.
- `isFieldVisible(name: string)`: Check if a field is visible (based on `visibleIf`).
- `isFieldEnabled(name: string)`: Check if a field is enabled (based on `enabledIf`).
- `getVisibleFields()`: Get all visible fields.
- `getEnabledFields()`: Get all enabled fields.

---

## Extending & Plugins

`acf-kit/core` is designed for extensibility. You can register new field types, add custom validation, or hook into form/field events using the plugin system and event emitter.

### Registering a Plugin

A plugin is simply a function that registers fields, validation, or hooks:

```ts
import { registerFieldType } from "@acf-kit/core/fields/registry";

export function myCustomFieldsPlugin() {
  registerFieldType("slug", { /* ... */ });
  // Register more fields, hooks, etc.
}
```

### Using the Event Emitter

You can listen to and emit events for advanced use cases:

```ts
import { eventEmitter } from "@acf-kit/core/utils/eventEmitter";

eventEmitter.on("field:change", (fieldName, value) => {
  console.log(`Field ${fieldName} changed to`, value);
});
```

---

## Validation

Validation is flexible and type-safe. You can use built-in validators, add custom sync/async validation, or compose validation logic.

### Field-level Validation

```ts
{
  name: "email",
  type: "text",
  validate: value => value.includes("@") ? undefined : "Invalid email"
}
```

### Async Validation

```ts
{
  name: "username",
  type: "text",
  asyncValidate: async value => {
    const exists = await checkUsernameExists(value);
    return exists ? "Username taken" : undefined;
  }
}
```

### Form-level Validation

You can validate the whole form synchronously or asynchronously:

```ts
form.validate(); // returns true/false
await form.validateAsync(); // returns error map
```

---

## Error Handling

Error handling in `acf-kit/core` is robust and developer-friendly. All error codes are centralized in `constants.ts`, and custom error classes are used for programmatic error handling.

### Error Codes & Classes

- All error codes (e.g., `ERR_FIELD_NOT_FOUND`, `ERR_INVALID_TYPE`) are exported from `constants.ts`.
- Errors thrown by the core (e.g., during field registration, value setting, or validation) are instances of custom error classes (see `errors.ts`).

### Example: Handling Errors

```ts
import { Form } from "@acf-kit/core";
import { ERR_FIELD_NOT_FOUND } from "@acf-kit/core/constants";

try {
  form.setValue("nonexistent", 123);
} catch (err) {
  if (err.code === ERR_FIELD_NOT_FOUND) {
    // Handle missing field
    console.error("Tried to set value for a field that does not exist.");
  } else {
    throw err;
  }
}
```

### Getting Form Errors

Use `form.getErrors()` to get a map of current field errors after validation:

```ts
form.validate();
const errors = form.getErrors();
if (errors.username) {
  // Show error to user
}
```

---

## Best Practices & Recipes

### Dynamic/Nested Forms

Use `group`, `repeater`, and `flexible` fields for deeply nested or dynamic forms:

```ts
{
  name: "sections",
  type: "repeater",
  fields: [
    { name: "title", type: "text" },
    { name: "content", type: "flexible", layouts: [
      { name: "textBlock", fields: [ { name: "text", type: "text" } ] },
      { name: "imageBlock", fields: [ { name: "url", type: "text" } ] }
    ]}
  ]
}
```

### Conditional Logic

Show/hide or enable/disable fields based on other values:

```ts
{
  name: "discountCode",
  type: "text",
  visibleIf: values => values.isVIP === true
}
```

### Composing Plugins

You can compose multiple plugins for large projects:

```ts
import { myCustomFieldsPlugin } from "./my-plugin";
import { anotherPlugin } from "./another-plugin";

myCustomFieldsPlugin();
anotherPlugin();
```

---

## FAQ

**Q: What frameworks does this work with?**  
A: It's framework-agnostic! Use it with React, Vue, Svelte, or even in Node.js apps.

**Q: Can I use my own field components?**  
A: Absolutely! Register them as custom field types.

**Q: How is validation handled?**  
A: Validation is configurable per field, with support for sync and async validators.

**Q: How do I handle deeply nested or dynamic forms?**  
A: Use `group`, `repeater`, and `flexible` fields for arbitrarily nested/dynamic structures.

**Q: Is there a UI?**  
A: No, this is a headless engine. Use it with your own UI components or framework.

---

## Contributing

- Keep all code type-safe and minimal.
- Add new field types or plugins via registration.
- Extend, don't hack—use the registry and event emitter.
- Add JSDoc for all public APIs.

---

## License

MIT

---

## Credits

- Inspired by [Advanced Custom Fields](https://www.advancedcustomfields.com/), [Formik](https://formik.org/), and modern headless CMSs.
- Built with ❤️ by the acf-kit team and contributors.

---

## TypeScript & DX Tips

- All APIs are fully typed. Use TypeScript's type inference for field values, errors, and configs.
- JSDoc is provided for all public APIs—hover for instant documentation in your editor.
- Use `FieldConfig<T>` and `FormConfig` generics for maximum type safety in custom field and form definitions.
- All error codes and constants are exported for programmatic use.

---

## UI Framework Recipes

### Vue Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Form } from '@acf-kit/core';
import { registerAllBuiltins } from '@acf-kit/core/fields/builtins';

registerAllBuiltins();
const form = new Form({
  fields: [
    { name: 'email', type: 'text', required: true }
  ]
});
const update = () => {};
</script>

<template>
  <form @submit.prevent="update">
    <input :value="form.getValue('email') || ''" @input="e => { form.setValue('email', e.target.value); update(); }" />
    <span v-if="form.getErrors().email">{{ form.getErrors().email }}</span>
    <button type="submit">Submit</button>
  </form>
</template>
```

### Svelte Example

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Form } from '@acf-kit/core';
  import { registerAllBuiltins } from '@acf-kit/core/fields/builtins';

  registerAllBuiltins();
  const form = new Form({
    fields: [
      { name: 'email', type: 'text', required: true }
    ]
  });
  let email = '';
  $: form.setValue('email', email);
</script>

<form on:submit|preventDefault={() => {}}>
  <input bind:value={email} />
  {#if form.getErrors().email}
    <span>{form.getErrors().email}</span>
  {/if}
  <button type="submit">Submit</button>
</form>
```

---

## Testing

- All core logic is framework-agnostic and easily testable with Jest, Vitest, or your favorite runner.
- Example:

```ts
test('validates required field', () => {
  const form = new Form({ fields: [ { name: 'foo', type: 'text', required: true } ] });
  expect(form.validate()).toBe(false);
  expect(form.getErrors().foo).toBeDefined();
});
```

---

## Roadmap

- More built-in field types (file, image, relation, etc.)
- More granular plugin hooks and events
- UI bindings for React, Vue, Svelte, and more
- CLI for scaffolding field configs
- More recipes and advanced guides

---

## Support & Community

- [GitHub Issues](https://github.com/shayan-m/acf-kit/issues) — Bug reports & feature requests
- [Discussions](https://github.com/shayan-m/acf-kit/discussions) — Ask questions, share ideas
- [Contributing Guide](./CONTRIBUTING.md) — How to get involved

---
