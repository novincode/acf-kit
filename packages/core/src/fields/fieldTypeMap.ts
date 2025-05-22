/**
 * FieldTypeConfigMap: Maps field type names to their config types for type-safe registration and creation.
 * Extend this map as you add new field types.
 */
import type { FieldConfig } from "./types";

export interface FieldTypeConfigMap {
  repeater: import("./repeater").RepeaterFieldConfig;
  group: import("./group").GroupFieldConfig;
  flexible: import("./flexible").FlexibleFieldConfig;
  // Built-in primitives
  text: FieldConfig<string>;
  number: FieldConfig<number>;
  boolean: FieldConfig<boolean>;
  date: FieldConfig<Date | string>;
  // Add more as needed
  [key: string]: FieldConfig<any, any>;
}
