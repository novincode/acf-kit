import type { FieldConfig, InferFormValues } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

// Explicit value shape for repeater fields
// Strongly type repeater config and value
export interface RepeaterFieldConfig<Fields extends readonly FieldConfig[] = FieldConfig[]> extends FieldConfig<InferFormValues<Fields>[], any, InferFormValues<Fields>> {
  type: "repeater";
  fields: Fields;
  minRows?: number;
  maxRows?: number;
}

export class RepeaterField<Fields extends readonly FieldConfig[] = FieldConfig[]> extends Field<InferFormValues<Fields>[], any> {
  forms: Form[];
  constructor(config: RepeaterFieldConfig<Fields>) {
    super(config);
    const fields = config.fields as unknown as FieldConfig[];
    this.forms = (config.defaultValue || []).map(
      (row: InferFormValues<Fields>) => new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: row[f.name as keyof InferFormValues<Fields>] })) })
    );
    this.enforceRowLimits();
  }
  addRow(defaults: Partial<InferFormValues<Fields>> = {}) {
    const fields = this.config.fields as unknown as FieldConfig[];
    this.forms.push(new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: defaults[f.name as keyof InferFormValues<Fields>] })) }));
    this.enforceRowLimits();
    this.emitChange();
  }
  removeRow(index: number) {
    this.forms.splice(index, 1);
    this.enforceRowLimits();
    this.emitChange();
  }
  getValue(): InferFormValues<Fields>[] {
    return this.forms.map(form => ({ ...form.getValues() }) as InferFormValues<Fields>);
  }
  setValue(value: InferFormValues<Fields>[]) {
    const fields = this.config.fields as unknown as FieldConfig[];
    this.forms = value.map((row: InferFormValues<Fields>) => new Form({ fields: fields.map((f: FieldConfig) => ({ ...f, defaultValue: row[f.name as keyof InferFormValues<Fields>] })) }));
    this.enforceRowLimits();
    this.emitChange();
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
