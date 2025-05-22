import type { FormConfig, FieldInstances, FormErrors } from "./types";
import type { Field, FieldConfig } from "../fields";
import { createField } from "../fields/registry";
import { validateForm } from "./validation";

/**
 * Form represents a collection of fields, their values, and errors.
 */
export class Form {
  readonly fields: FieldInstances = {};
  private errors: FormErrors = {};

  constructor(config: FormConfig) {
    for (const fieldConfig of config.fields) {
      this.fields[fieldConfig.name] = createField(fieldConfig.type, fieldConfig);
    }
  }

  /**
   * Set the value of a field.
   */
  setValue<T = unknown>(name: string, value: T) {
    this.fields[name]?.setValue(value);
  }

  /**
   * Get the value of a field.
   */
  getValue<T = unknown>(name: string): T | undefined {
    return this.fields[name]?.getValue();
  }

  /**
   * Get all current values as a record.
   */
  getValues(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const name in this.fields) {
      out[name] = this.fields[name].getValue();
    }
    return out;
  }

  /**
   * Validate the form using all validation rules.
   */
  validate(): boolean {
    this.errors = validateForm(this.fields);
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Get the current errors.
   */
  getErrors(): FormErrors {
    return { ...this.errors };
  }

  /**
   * Should the field be visible?
   */
  isFieldVisible(name: string): boolean {
    const field = this.fields[name];
    if (!field) return false;
    if (typeof field.config.visibleIf === "function") {
      return field.config.visibleIf(this.getValues());
    }
    return true;
  }

  /**
   * Should the field be enabled?
   */
  isFieldEnabled(name: string): boolean {
    const field = this.fields[name];
    if (!field) return false;
    if (typeof field.config.enabledIf === "function") {
      return field.config.enabledIf(this.getValues());
    }
    return true;
  }

  /**
   * Get a record of visible fields only.
   */
  getVisibleFields(): Record<string, Field<any, any>> {
    const result: Record<string, Field<any, any>> = {};
    for (const name in this.fields) {
      if (this.isFieldVisible(name)) {
        result[name] = this.fields[name];
      }
    }
    return result;
  }

  /**
   * Get all fields that are currently enabled (based on enabledIf).
   */
  getEnabledFields(): FieldInstances {
    const values = this.getValues();
    const enabled: FieldInstances = {};
    for (const name in this.fields) {
      const field = this.fields[name];
      const cond = field.config.enabledIf;
      if (!cond || cond(values)) {
        enabled[name] = field;
      }
    }
    return enabled;
  }

  /**
   * Async validation for all fields in the form.
   * Returns a map of field name to error (if any).
   */
  async validateAsync(): Promise<Record<string, string | undefined>> {
    const values = this.getValues();
    const errors: Record<string, string | undefined> = {};
    for (const [name, field] of Object.entries(this.fields)) {
      if (!this.isFieldVisible(name)) continue;
      const error = await field.validateAsync(values);
      if (error) errors[name] = error;
    }
    this.errors = errors;
    return errors;
  }
}
