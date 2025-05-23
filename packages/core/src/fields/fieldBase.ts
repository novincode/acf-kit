import type { FieldConfig } from "./types";
import { EventEmitter } from "../utils/eventEmitter";

/**
 * Field represents a single form field, its config, and current value.
 * @template TConfig - The field config type
 * @template TValue - The value type for this field
 * @template TValues - The full form value type
 */
export class Field<TConfig extends FieldConfig<TValues>, TValue, TValues> {
  readonly config: TConfig;
  value: TValue;

  // Async options state
  options: [] = [];
  loading: boolean = false;
  loadError?: unknown;

  private _emitter = new EventEmitter();

  constructor(config: TConfig, initialValue?: TValue) {
    this.config = config;
    this.value = initialValue !== undefined ? initialValue : (config.defaultValue as TValue);
  }

  onChange(listener: () => void) {
    this._emitter.on("change", listener);
  }
  offChange(listener: () => void) {
    this._emitter.off("change", listener);
  }
  protected emitChange() {
    this._emitter.emit("change", undefined);
  }

  setValue(value: TValue): void {
    this.value = value;
    this.emitChange();
  }

  getValue(): TValue {
    return this.value;
  }

  /**
   * Async validation for the field.
   * Returns error message (string) or undefined if valid.
   */
  async validateAsync(values: TValues): Promise<string | undefined> {
    const { config } = this;
    const value = this.getValue();

    if (config.required && (value === undefined || value === null || value === "")) {
      return "Field is required";
    }

    if (typeof config.validate === "function") {
      try {
        // Use type assertion to allow validation with the correct types
        const validate = config.validate as (value: any, values: TValues) => string | undefined | Promise<string | undefined>;
        const result = validate(value, values);
        return result instanceof Promise ? await result : result;
      } catch (error) {
        console.error("Validation error:", error);
        return "Validation error";
      }
    }

    // Optional: Add schema validation support here if you use zod/yup
    return undefined;
  }
}