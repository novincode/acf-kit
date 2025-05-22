/**
 * Centralized field type names for all built-in and advanced fields.
 * Use these constants to avoid typos and enable refactoring.
 */
export const FIELD_TYPE_TEXT = "text";
export const FIELD_TYPE_NUMBER = "number";
export const FIELD_TYPE_BOOLEAN = "boolean";
export const FIELD_TYPE_DATE = "date";
export const FIELD_TYPE_REPEATER = "repeater";
export const FIELD_TYPE_GROUP = "group";
export const FIELD_TYPE_FLEXIBLE = "flexible";

/**
 * Error codes for all custom errors in acf-kit/core.
 * Use these for programmatic error handling and UI mapping.
 */
export enum ErrorCodes {
  FIELD_TYPE_NOT_REGISTERED = "FIELD_TYPE_NOT_REGISTERED",
  FORM_CONFIG_ERROR = "FORM_CONFIG_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}