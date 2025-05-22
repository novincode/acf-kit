import type { Field, FieldConfig } from "../fields";

/**
 * The shape of a form's fields: map of field name to Field instance.
 */
export type FieldInstances = Record<string, Field<any, any>>;

/**
 * Errors keyed by field name.
 */
export type FormErrors = Record<string, string | undefined>;

/**
 * Config for initializing a form.
 */
export interface FormConfig {
  fields: FieldConfig<any, any>[];
  // Extendable for future (validation, plugins, etc)
}

/**
 * Function signature for conditional logic.
 */
export type ConditionFn = (values: Record<string, unknown>) => boolean;
