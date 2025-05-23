import type { Field } from "../fields";
import type { FieldConfig } from "../fields/types";

/**
 * Validate a single field (sync only).
 * Returns error message (string) or undefined if valid.
 * If the field's validate function is async, this will not handle it—use field.validateAsync for async validation.
 */
export function validateField<TValue = unknown, TValues = Record<string, unknown>>(
  field: Field<FieldConfig<TValues>, TValue, TValues>
): string | undefined {
  const { config } = field;
  const value = field.getValue();

  if (config.required && (value === undefined || value === null || value === "")) {
    return "Field is required";
  }
  if (typeof config.validate === "function") {
    // Only handle sync validation here
    const values = {} as TValues; // We don't have access to full form values here
    try {
      // Use a more specific type for the validate function
      type ValidateFn = (value: TValue, values: TValues) => string | undefined | Promise<string | undefined>;
      const validate = config.validate as ValidateFn;
      const result = validate(value, values);
      if (result instanceof Promise) {
        // Warn: async validation should use validateAsync
        return undefined;
      }
      return result;
    } catch (error) {
      console.error("Validation error:", error);
      return "Validation error";
    }
  }
  // Support for zod or other schema-based validators
  if ('schema' in config) {
    // Type check for schema with safeParse method
    interface SchemaLike {
      safeParse: (value: unknown) => { success: boolean; error?: { message?: string } };
    }
    
    const maybeSchema = config.schema as unknown;
    if (maybeSchema && 
        typeof maybeSchema === 'object' && 
        'safeParse' in maybeSchema && 
        typeof (maybeSchema as SchemaLike).safeParse === 'function') {
      
      const schema = maybeSchema as SchemaLike;
      const result = schema.safeParse(value);
      if (!result.success) {
        return result.error?.message || "Invalid value";
      }
    }
  }
  return undefined;
}

/**
 * Validate all fields in a form (sync only).
 * Returns a map of field name to error (if any).
 */
export function validateForm<TValues = Record<string, unknown>>(
  fields: Record<string, Field<FieldConfig<TValues>, unknown, TValues>>
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  for (const [name, field] of Object.entries(fields)) {
    const error = validateField(field);
    if (error) errors[name] = error;
  }
  return errors;
}
