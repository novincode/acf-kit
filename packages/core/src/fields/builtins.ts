import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";

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

// --- Register all built-ins at once (for convenience) ---
export function registerAllBuiltins() {
  registerTextField();
  registerNumberField();
  registerBooleanField();
  registerDateField();
}

// --- Advanced fields ---
import "./repeater";
import "./group";
import "./flexible";

// Optional: Export these for tree-shaking, code splitting, or re-registration if needed.
export {};