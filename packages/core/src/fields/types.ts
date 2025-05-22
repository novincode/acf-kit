/**
 * OptionType: Standard option shape for select, radio, etc.
 */
export interface OptionType {
  label: string;
  value: string | number | boolean;
  [key: string]: unknown;
}

/**
 * Built-in and custom field types.
 */
export type FieldType = "text" | "number" | "boolean" | "date" | string;

import type { ConditionFn } from "../form/types";

/**
 * FieldConfig describes the options for an individual field.
 * @template T - The value type of the field.
 * @template S - The schema type (optional, for zod or custom).
 *
 * - Use generics for value/config types everywhere.
 * - Extendable for plugins and custom field types.
 */
export interface FieldConfig<T = unknown, S = unknown> {
  name: string;
  type: FieldType;
  label?: string;
  description?: string;
  defaultValue?: T;
  required?: boolean;
  schema?: S; // For zod or custom schemas
  /**
   * Validation: can be sync or async.
   */
  validate?: (value: T, values?: Record<string, any>) => string | undefined | Promise<string | undefined>;
  visibleIf?: ConditionFn;
  enabledIf?: ConditionFn;
  /**
   * For fields like 'select', 'relationship', etc. Allows fetching options async (e.g. remote API).
   * Signature: (search: string, values?: Record<string, any>) => Promise<OptionType[]>
   */
  asyncOptions?: (search: string, values?: Record<string, any>) => Promise<OptionType[]>;

  /**
   * For fields that want to fetch/display a value by ID (e.g. relationship/autocomplete).
   * Signature: (id: any, values?: Record<string, any>) => Promise<any>
   */
  fetchValue?: (id: any, values?: Record<string, any>) => Promise<any>;
  /**
   * For static options (e.g. predefined list of values).
   */
  options?: OptionType[]; // For static options
  [key: string]: unknown; // Extensible for plugins
}
