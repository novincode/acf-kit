import type { FieldConfig } from "./types";

export class Field<T = any> {
  config: FieldConfig<T>;
  constructor(config: FieldConfig<T>) {
    this.config = config;
  }
}
