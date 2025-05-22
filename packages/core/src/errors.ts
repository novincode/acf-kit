import { ErrorCodes } from "./constants";

/**
 * Base error for all acf-kit/core logic.
 */
export class AcfKitError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AcfKitError";
    this.code = code;
  }
}

/**
 * Thrown when a field type is not registered or invalid.
 */
export class FieldTypeError extends AcfKitError {
  constructor(type: string) {
    super(`Field type "${type}" is not registered or invalid.`, ErrorCodes.FIELD_TYPE_NOT_REGISTERED);
    this.name = "FieldTypeError";
  }
}

/**
 * Thrown when a form has invalid configuration.
 */
export class FormConfigError extends AcfKitError {
  constructor(message: string) {
    super(`Form configuration error: ${message}`, ErrorCodes.FORM_CONFIG_ERROR);
    this.name = "FormConfigError";
  }
}

/**
 * Thrown on validation errors (optional: for advanced async flows).
 */
export class ValidationError extends AcfKitError {
  field: string;
  constructor(field: string, message: string) {
    super(`Validation error in "${field}": ${message}`, ErrorCodes.VALIDATION_ERROR);
    this.name = "ValidationError";
    this.field = field;
  }
}
