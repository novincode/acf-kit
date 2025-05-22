import type { Field } from "../fields";

/**
 * Validate a single field (sync only).
 * Returns error message (string) or undefined if valid.
 * If the field's validate function is async, this will not handle it—use field.validateAsync for async validation.
 */
export function validateField<T = unknown>(field: Field<T, any>): string | undefined {
  const { config } = field;
  const value = field.getValue();

  if (config.required && (value === undefined || value === null || value === "")) {
    return "Field is required";
  }
  if (typeof config.validate === "function") {
    // Only handle sync validation here
    const result = config.validate(value);
    if (result instanceof Promise) {
      // Warn: async validation should use validateAsync
      return undefined;
    }
    return result;
  }
  // Optional: If you want to support a schema (e.g. zod), check and run here.
  if (config.schema && typeof (config.schema as any).safeParse === "function") {
    const result = (config.schema as any).safeParse(value);
    if (!result.success) {
      return result.error?.message || "Invalid value";
    }
  }
  return undefined;
}

/**
 * Validate all fields in a form (sync only).
 * Returns a map of field name to error (if any).
 */
export function validateForm(fields: Record<string, Field<any, any>>): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  for (const [name, field] of Object.entries(fields)) {
    const error = validateField(field);
    if (error) errors[name] = error;
  }
  return errors;
}
