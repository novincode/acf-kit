import type { Field } from "../fields";

export interface FormConfig {
  fields: Field<any>[];
  // You can add more config options later (e.g., validation, hooks)
}

export interface FormInstance {
  fields: Field<any>[];
  // Add more state as needed later!
}
