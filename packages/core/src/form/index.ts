import type { FormConfig } from "./types";
import type { Field } from "../fields";
import { validateForm } from "./validation";

export class Form {
  fields: Field<any>[];
  values: Record<string, any>;
  errors: Record<string, string>;

  constructor(config: FormConfig) {
    this.fields = config.fields;
    this.values = {};
    this.errors = {};
    // Initialize values with defaults
    for (const field of this.fields) {
      this.values[field.config.name] = field.config.defaultValue ?? "";
    }
  }

  setValue(name: string, value: any) {
    this.values[name] = value;
  }

  getValue(name: string) {
    return this.values[name];
  }

  validate(): boolean {
    this.errors = validateForm(this.fields, this.values);
    return Object.keys(this.errors).length === 0;
  }

  getErrors(): Record<string, string> {
    return this.errors;
  }

  getValues(): Record<string, any> {
    return this.values;
  }
}
