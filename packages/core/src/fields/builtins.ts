import type { FieldConfig } from "./types";
import { Field } from "./fieldBase";
import { fieldRegistry, registerFieldType } from "./registry";
import { GroupField } from "./group";
import { RepeaterField } from "./repeater";
import { FlexibleField } from "./flexible";

// --- Modular built-in field registration for tree-shaking ---
export function registerTextField() {
  registerFieldType("text", (config: FieldConfig<string>) => new Field<string>(config));
}
export function registerNumberField() {
  registerFieldType("number", (config: FieldConfig<number>) => new Field<number>(config));
}
export function registerBooleanField() {
  registerFieldType("boolean", (config: FieldConfig<boolean>) => new Field<boolean>(config));
}
export function registerDateField() {
  registerFieldType("date", (config: FieldConfig<Date | string>) => new Field<Date | string>(config));
}
export function registerTextareaField() {
  registerFieldType("textarea", (config: FieldConfig<string>) => new Field<string>(config));
}

// --- Register all built-ins at once (for convenience) ---
export function registerAllBuiltins() {
  registerTextField();
  registerTextareaField();
  registerNumberField();
  registerBooleanField();
  registerDateField();
  registerFieldType("group", (config) => new GroupField(config));
  registerFieldType("repeater", (config) => new RepeaterField(config));
  registerFieldType("flexible", (config) => new FlexibleField(config));
}