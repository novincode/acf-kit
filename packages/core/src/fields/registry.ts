import type { FieldTypeConfigMap } from "./fieldTypeMap";
import type { FieldConfig, FieldType } from "./types";
import { Field } from "./index";

/**
 * A factory function that creates a Field instance from config.
 * The function is kept deliberately loose-typed at this level,
 * and specific implementations provide the strong typing.
 */
export type FieldFactory<
  TConfig extends FieldConfig<any> = FieldConfig<any>,
  TValue = unknown, 
  TValues = Record<string, unknown>
> = (config: TConfig) => Field<TConfig, TValue, TValues>;

// Use a plain object for runtime, but enforce types at registration/creation
export const fieldRegistry: { [key: string]: FieldFactory<FieldConfig<any>, unknown, any> } = {};

/**
 * Register a new field type and its factory.
 * @param type - The field type name
 * @param factory - The factory function for this field type
 */
export function registerFieldType<T extends keyof FieldTypeConfigMap>(
  type: T,
  factory: FieldFactory<FieldConfig<any>, unknown, any>
) {
  fieldRegistry[type as string] = factory;
}

/**
 * Create a Field instance by type and config.
 * Throws if the field type is not registered.
 * @param type - The field type name
 * @param config - The config for this field type
 */
export function createField<T extends keyof FieldTypeConfigMap, TValues = Record<string, unknown>>(
  type: T,
  config: FieldTypeConfigMap[T]
): Field<FieldConfig<TValues>, unknown, TValues> {
  const factory = fieldRegistry[type as string];
  if (!factory) throw new Error(`Field type "${type}" is not registered.`);
  return factory(config) as Field<FieldConfig<TValues>, unknown, TValues>;
}

/**
 * List all registered field types.
 */
export function listFieldTypes(): FieldType[] {
  return Object.keys(fieldRegistry) as FieldType[];
}