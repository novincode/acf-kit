/**
 * FieldTypeConfigMap: Maps field type names to their config types for type-safe registration and creation.
 * Extend this map as you add new field types.
 */
import type { FieldConfig, RepeaterFieldConfig, GroupFieldConfig, FlexibleFieldConfig } from "./types";

export interface FieldTypeConfigMap {
  repeater: RepeaterFieldConfig<any, any>;
  group: GroupFieldConfig<any, any>;
  flexible: FlexibleFieldConfig<any, any>;
  // Built-in primitives
  text: FieldConfig<string>;
  number: FieldConfig<number>;
  boolean: FieldConfig<boolean>;
  date: FieldConfig<Date | string>;
  // Add more as needed
  [key: string]: FieldConfig<any>;
}
