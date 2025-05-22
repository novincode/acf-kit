import type { FieldConfig, FieldType } from "./types";
import { Field } from "./index";

/**
 * --- Type-safe registry for field types ---
 */
export interface FieldTypeConfigMap {
  repeater: import("./repeater").RepeaterFieldConfig;
  group: import("./group").GroupFieldConfig;
  flexible: import("./flexible").FlexibleFieldConfig;
  // Add more as needed
  [key: string]: import("./types").FieldConfig<any, any>;
}

export type FieldFactory<T extends keyof FieldTypeConfigMap = string> = (
  config: FieldTypeConfigMap[T]
) => Field<any, any>;

// Use a plain object for runtime, but enforce types at registration/creation
const fieldRegistry: { [key: string]: FieldFactory<any> } = {};

/**
 * Register a new field type and its factory.
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
