import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";

// --- Text Field ---
registerFieldType("text", (config: FieldConfig<string>) => new Field<string>(config));

// --- Number Field ---
registerFieldType("number", (config: FieldConfig<number>) => new Field<number>(config));

// --- Boolean Field ---
registerFieldType("boolean", (config: FieldConfig<boolean>) => new Field<boolean>(config));

// --- Date Field ---
registerFieldType("date", (config: FieldConfig<Date | string>) => new Field<Date | string>(config));

// Add more built-ins here as needed

import "./repeater";
import "./group";
import "./flexible";

// Optional: Export these for tree-shaking, code splitting, or re-registration if needed.
export {};