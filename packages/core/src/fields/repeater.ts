import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

// Explicit value shape for repeater fields
export interface RepeaterFieldConfig extends FieldConfig<Record<string, unknown>[], any> {
  type: "repeater";
  fields: FieldConfig[];
  minRows?: number;
  maxRows?: number;
}

class RepeaterField extends Field<Record<string, unknown>[], any> {
  forms: Form[];

  constructor(config: RepeaterFieldConfig) {
    super(config);
    const fields = config.fields as FieldConfig[];
    this.forms = (config.defaultValue || []).map(
      (row: Record<string, unknown>) => new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: row[f.name as string] })) })
    );
    this.enforceRowLimits();
  }

  addRow(defaults: Record<string, any> = {}) {
    const fields = this.config.fields as FieldConfig[];
    this.forms.push(new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: defaults[f.name as string] })) }));
    this.enforceRowLimits();
  }

  removeRow(index: number) {
    this.forms.splice(index, 1);
    this.enforceRowLimits();
  }

  getValue(): Record<string, unknown>[] {
    return this.forms.map(form => form.getValues());
  }

  setValue(value: Record<string, unknown>[]) {
    const fields = this.config.fields as FieldConfig[];
    this.forms = value.map((row: Record<string, unknown>) => new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: row[f.name as string] })) }));
    this.enforceRowLimits();
  }

  private enforceRowLimits() {
    const { minRows, maxRows } = this.config;
    if (typeof minRows === "number" && this.forms.length < minRows) {
      while (this.forms.length < minRows) this.addRow();
    }
    if (typeof maxRows === "number" && this.forms.length > maxRows) {
      this.forms.length = maxRows;
    }
  }
}

registerFieldType("repeater", (config) => new RepeaterField(config));
