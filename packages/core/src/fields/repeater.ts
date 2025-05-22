import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface RepeaterFieldConfig extends FieldConfig<any[], any> {
  type: "repeater";
  fields: FieldConfig[];
  minRows?: number;
  maxRows?: number;
}

class RepeaterField extends Field<any[], any> {
  forms: Form[];

  constructor(config: RepeaterFieldConfig) {
    super(config);
    this.forms = (config.defaultValue || []).map(
      row => new Form({ fields: config.fields.map(f => ({ ...f, defaultValue: row[f.name] })) })
    );
  }

  addRow(defaults: Record<string, any> = {}) {
    const fields = (this.config as RepeaterFieldConfig).fields;
    this.forms.push(new Form({ fields: fields.map(f => ({ ...f, defaultValue: defaults[f.name] })) }));
  }

  removeRow(index: number) {
    this.forms.splice(index, 1);
  }

  getValue() {
    return this.forms.map(form => form.getValues());
  }

  setValue(value: any[]) {
    const fields = (this.config as RepeaterFieldConfig).fields;
    this.forms = value.map(row => new Form({ fields: fields.map(f => ({ ...f, defaultValue: row[f.name] })) }));
  }
}

registerFieldType("repeater", (config) => new RepeaterField(config));
