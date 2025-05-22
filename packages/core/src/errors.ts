/**
 * Base error for all acf-kit/core logic.
 */
export class AcfKitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcfKitError";
  }
}

/**
 * Thrown when a field type is not registered or invalid.
 */
export class FieldTypeError extends AcfKitError {
  constructor(type: string) {
    super(`Field type "${type}" is not registered or invalid.`);
    this.name = "FieldTypeError";
  }
}

/**
 * Thrown when a form has invalid configuration.
 */
export class FormConfigError extends AcfKitError {
  constructor(message: string) {
    super(`Form configuration error: ${message}`);
    this.name = "FormConfigError";
  }
}

/**
 * Thrown on validation errors (optional: for advanced async flows).
 */
export class ValidationError extends AcfKitError {
  field: string;
  constructor(field: string, message: string) {
    super(`Validation error in "${field}": ${message}`);
    this.name = "ValidationError";
    this.field = field;
  }
}
