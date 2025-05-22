import { ZodObject, ZodTypeAny } from "zod";
import type { Field } from "../fields";

// Validate a single field using its schema and custom validate
export function validateField(field: Field, value: any): string | void {
  try {
    if (field.config.required && (value === undefined || value === "")) {
      return `${field.config.label || field.config.name} is required`;
    }
    if (field.config.validate) {
      const customError = field.config.validate(value);
      if (customError) return customError;
    }
    if (field.config.schema) {
      (field.config.schema as ZodTypeAny).parse(value);
    }
  } catch (e: any) {
    return e.message;
  }
}

// Validate all fields in the form
export function validateForm(fields: Field[], values: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateField(field, values[field.config.name]);
    if (err) errors[field.config.name] = err;
  }
  return errors;
}
