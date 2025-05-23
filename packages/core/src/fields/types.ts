/**
 * OptionType: Standard option shape for select, radio, etc.
 */
export interface OptionType {
  label: string;
  value: string | number | boolean;
  [key: string]: unknown;
}

// --- FieldTypeMap: extensible via declaration merging ---
export interface FieldTypeMap {
  text: string;
  number: number;
  boolean: boolean;
  date: string;
  textarea: string;
  group: never; // handled below
  repeater: never; // handled below
  flexible: never; // handled below
  // Extendable by user
}

export type FieldType = keyof FieldTypeMap;

// --- Base config for all fields ---
export interface BaseFieldConfig<TType extends FieldType, TValue, TValues> {
  name: string;
  type: TType;
  label?: string;
  required?: boolean;
  defaultValue?: TValue;
  visibleIf?: (values: TValues) => boolean;
  enabledIf?: (values: TValues) => boolean;
  validate?: (value: TValue, values: TValues) => string | undefined | Promise<string | undefined>;
}

// --- Primitive fields ---
type PrimitiveFieldConfig<TType extends keyof FieldTypeMap, TValues> =
  BaseFieldConfig<TType, FieldTypeMap[TType], TValues>;

// --- Group field ---
export interface GroupFieldConfig<TFields extends readonly FieldConfig<any>[], TValues> extends BaseFieldConfig<"group", InferFormValues<TFields>, TValues> {
  type: "group";
  fields: TFields;
}

// --- Repeater field ---
export interface RepeaterFieldConfig<TFields extends readonly FieldConfig<any>[], TValues> extends BaseFieldConfig<"repeater", InferFormValues<TFields>[], TValues> {
  type: "repeater";
  fields: TFields;
  minRows?: number;
  maxRows?: number;
}

// --- Flexible field ---
export interface FlexibleLayout<TFields extends readonly FieldConfig<any>[]> {
  name: string;
  label: string;
  fields: TFields;
}
export interface FlexibleFieldConfig<TLayouts extends readonly FlexibleLayout<any>[], TValues> extends BaseFieldConfig<"flexible", Array<{ layout: TLayouts[number]["name"]; values: InferFormValues<TLayouts[number]["fields"]> }>, TValues> {
  type: "flexible";
  layouts: TLayouts;
  minRows?: number;
  maxRows?: number;
}

// --- Discriminated union for all fields ---
export type FieldConfig<TValues = any> =
  | PrimitiveFieldConfig<"text", TValues>
  | PrimitiveFieldConfig<"number", TValues>
  | PrimitiveFieldConfig<"boolean", TValues>
  | PrimitiveFieldConfig<"date", TValues>
  | PrimitiveFieldConfig<"textarea", TValues>
  | GroupFieldConfig<any, TValues>
  | RepeaterFieldConfig<any, TValues>
  | FlexibleFieldConfig<any, TValues>;

// --- Recursive value inference ---
export type InferFormValues<Fields extends readonly FieldConfig<any>[]> = {
  [K in Fields[number] as K["name"]]:
    K extends GroupFieldConfig<infer GFields, any> ? InferFormValues<GFields> :
    K extends RepeaterFieldConfig<infer RFields, any> ? InferFormValues<RFields>[] :
    K extends FlexibleFieldConfig<infer L, any> ? { layout: L[number]["name"]; values: InferFormValues<L[number]["fields"]> }[] :
    K extends BaseFieldConfig<any, infer V, any> ? V :
    never;
};

// --- defineFields: deeply type-safe, composable ---
export function defineFields<T extends readonly FieldConfig<any>[]>(fields: T): T {
  return fields;
}

// --- createFields: ergonomic factory for top-level fields ---
export function createFields<TValues>() {
  return <T extends readonly FieldConfig<TValues>[]>(fields: T) => fields;
}

// --- Extensibility: users can augment FieldTypeMap and FieldConfig union via declaration merging ---
// Example:
// declare module './types' {
//   interface FieldTypeMap { color: string; }
// }
// export interface ColorFieldConfig<TValues> extends BaseFieldConfig<'color', string, TValues> { type: 'color'; format?: 'hex' | 'rgb'; }
// Add to FieldConfig union as needed.
