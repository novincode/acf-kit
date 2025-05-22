import { ZodTypeAny } from "zod";

export type FieldType = "text" | "number" | "textarea" | string;

export interface FieldConfig<T = any> {
  name: string;
  label?: string;
  type: FieldType;
  defaultValue?: T;
  required?: boolean;
  validate?: (value: T) => string | void;
  schema?: ZodTypeAny;
  [key: string]: any;
}
