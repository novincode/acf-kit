import type { FieldTypeConfigMap } from "./fieldTypeMap";
import type { FieldConfig, FieldType } from "./types";
import { Field } from "./index";

/**
 * A factory function that creates a Field instance from config.
 * @template T - The field type key in FieldTypeConfigMap
 */
export type FieldFactory<T extends keyof FieldTypeConfigMap = string> = (
  config: FieldTypeConfigMap[T]
) => Field<any, any>;

// Use a plain object for runtime, but enforce types at registration/creation
export const fieldRegistry: { [key: string]: FieldFactory<any> } = {};

/**
 * Register a new field type and its factory.
 * @param type - The field type name
 * @param factory - The factory function for this field type
 */
export function registerFieldType<T extends keyof FieldTypeConfigMap>(
  type: T,
  factory: FieldFactory<T>
) {
  fieldRegistry[type as string] = factory as FieldFactory<any>;
}

/**
 * Create a Field instance by type and config.
 * Throws if the field type is not registered.
 * @param type - The field type name
 * @param config - The config for this field type
 */
export function createField<T extends keyof FieldTypeConfigMap>(
  type: T,
  config: FieldTypeConfigMap[T]
): Field<any, any> {
  const factory = fieldRegistry[type as string];
  if (!factory) throw new Error(`Field type "${type}" is not registered.`);
  return factory(config);
}

/**
 * List all registered field types.
 */
export function listFieldTypes(): FieldType[] {
  return Object.keys(fieldRegistry);
}
