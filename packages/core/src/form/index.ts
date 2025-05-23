import type { FormConfig, FieldInstances, FormErrors } from "./types";
import type { Field, FieldConfig } from "../fields";
import { createField } from "../fields/registry";
import { validateForm } from "./validation";
import { EventEmitter } from "../utils/eventEmitter";

/**
 * Form represents a collection of fields, their values, and errors.
 * Provides methods for value access, validation, and conditional logic.
 */
export class Form<TValues = Record<string, unknown>> {
  readonly fields: FieldInstances<TValues> = {};
  private errors: FormErrors = {};
  private emitter = new EventEmitter<FormEvents>();

  constructor(config: FormConfig) {
    for (const fieldConfig of config.fields) {
      this.fields[fieldConfig.name] = createField(fieldConfig.type, fieldConfig) as Field<FieldConfig<TValues>, unknown, TValues>;
    }
  }

  /**
   * Subscribe to form events (field:change, field:error, etc)
   */
  on<K extends keyof FormEvents>(event: K, cb: (payload: FormEvents[K]) => void) {
    this.emitter.on(event, cb);
  }
  off<K extends keyof FormEvents>(event: K, cb: (payload: FormEvents[K]) => void) {
    this.emitter.off(event, cb);
  }

  /**
   * Set the value of a field and emit change event.
   */
  setValue<T = unknown>(name: string, value: T) {
    this.fields[name]?.setValue(value);
    this.emitter.emit("field:change", { name, value });
  }

  /**
   * Get the value of a field.
   */
  getValue<T = unknown>(name: string): T | undefined {
    return this.fields[name]?.getValue() as T | undefined;
  }

  /**
   * Get all current values as a record.
   */
  getValues(): TValues {
    const out: Record<string, unknown> = {};
    for (const name in this.fields) {
      out[name] = this.fields[name].getValue();
    }
    // We need to cast to TValues to satisfy the type system
    return out as unknown as TValues;
  }

  /**
   * Validate the form using all validation rules.
   */
  validate(): boolean {
    this.errors = validateForm(this.fields);
    // Emit error events for each field
    for (const name in this.errors) {
      this.emitter.emit("field:error", { name, error: this.errors[name] });
    }
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
  getVisibleFields(): FieldInstances<TValues> {
    const result: FieldInstances<TValues> = {};
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
  getEnabledFields(): FieldInstances<TValues> {
    const values = this.getValues();
    const enabled: FieldInstances<TValues> = {};
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

  /**
   * Get the error message for a field, if any.
   */
  getFieldError(name: string): string | undefined {
    return this.errors[name];
  }
}

export type FormEvents = {
  "field:change": { name: string; value: unknown };
  "field:error": { name: string; error: string | undefined };
};
