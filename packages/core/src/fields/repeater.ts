import type { FieldConfig, InferFormValues, RepeaterFieldConfig } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export class RepeaterField<TFields extends readonly FieldConfig<TValues>[], TValues> extends Field<RepeaterFieldConfig<TFields, TValues>, InferFormValues<TFields>[], TValues> {
  forms: Form[];
  
  constructor(config: RepeaterFieldConfig<TFields, TValues>) {
    super(config);
    const fields = [...config.fields]; // Convert readonly to mutable
    this.forms = (config.defaultValue || []).map(
      (row: InferFormValues<TFields>) => new Form({ fields })
    );
    this.enforceRowLimits();
  }
  addRow() {
    const fields = [...this.config.fields]; // Convert readonly to mutable
    this.forms.push(new Form({ fields }));
    this.enforceRowLimits();
    this.emitChange();
  }
  
  removeRow(index: number) {
    this.forms.splice(index, 1);
    this.enforceRowLimits();
    this.emitChange();
  }
  
  getValue(): InferFormValues<TFields>[] {
    return this.forms.map(form => ({ ...form.getValues() }) as InferFormValues<TFields>);
  }
  
  setValue(value: InferFormValues<TFields>[]) {
    const fields = [...this.config.fields]; // Convert readonly to mutable
    this.forms = value.map(() => new Form({ fields }));
    this.enforceRowLimits();
    this.emitChange();
  }
  
  private enforceRowLimits() {
    const { minRows, maxRows } = this.config;
    if (typeof minRows === "number" && this.forms.length < minRows) {
      const fieldsArray = [...this.config.fields]; // Create a local copy to avoid recursive calls
      while (this.forms.length < minRows) {
        this.forms.push(new Form({ fields: fieldsArray }));
      }
    }
    if (typeof maxRows === "number" && this.forms.length > maxRows) {
      this.forms.length = maxRows;
    }
  }
}

registerFieldType("repeater", ((config) => {
  const typedConfig = config as RepeaterFieldConfig<any, any>;
  return new RepeaterField<any, any>(typedConfig);
}));
