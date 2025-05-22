import type { FieldConfig } from "./types";

/**
 * Field represents a single form field, its config, and current value.
 * @template T - The value type
 * @template S - The schema type
 */
export class Field<T = unknown, S = unknown> {
  readonly config: FieldConfig<T, S>;
  value: T;

  // Async options state
  options: any[] = [];
  loading: boolean = false;
  loadError?: any;

  constructor(config: FieldConfig<T, S>) {
    this.config = config;
    this.value = config.defaultValue as T;
  }

  setValue(value: T): void {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  /**
   * Fetch options (for select/relationship/autocomplete fields).
   */
  async fetchOptions(search = ""): Promise<any[]> {
    if (typeof this.config.asyncOptions !== "function") return [];
    this.loading = true;
    this.loadError = undefined;
    try {
      const result = await this.config.asyncOptions(search);
      this.options = result;
      return result;
    } catch (e) {
      this.loadError = e;
      return [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Fetch value by id (for relationship/autocomplete fields).
   */
  async fetchValue(id: any): Promise<any> {
    if (typeof this.config.fetchValue !== "function") return undefined;
    return this.config.fetchValue(id);
  }

  /**
   * Async validation for the field.
   * Returns error message (string) or undefined if valid.
   */
  async validateAsync(values?: Record<string, any>): Promise<string | undefined> {
    const { config } = this;
    const value = this.getValue();

    if (config.required && (value === undefined || value === null || value === "")) {
      return "Field is required";
    }

    if (typeof config.validate === "function") {
      const result = config.validate(value, values);
      return result instanceof Promise ? await result : result;
    }

    // Optional: Add schema validation support here if you use zod/yup
    return undefined;
  }
}

export type { FieldConfig } from "./types";
