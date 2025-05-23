import type { Field, FieldConfig } from "../fields";
import type { InferFormValues } from "../fields/types";

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
export interface FormConfig<Fields extends readonly FieldConfig[] = FieldConfig[]> {
  fields: Fields;
  // Extendable for future (validation, plugins, etc)
}

/**
 * Utility: Infer value shape from FormConfig
 */
export type FormValuesFromConfig<C extends FormConfig> = C["fields"] extends readonly FieldConfig[]
  ? InferFormValues<C["fields"]>
  : never;
