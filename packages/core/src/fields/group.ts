import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

// Explicit value shape for group fields
export interface GroupFieldConfig extends FieldConfig<Record<string, unknown>, any> {
  type: "group";
  fields: FieldConfig[];
}

class GroupField extends Field<Record<string, unknown>, any> {
  form: Form;

  constructor(config: GroupFieldConfig) {
    super(config);
    this.form = new Form({ fields: config.fields.map(f => ({ ...f, defaultValue: config.defaultValue?.[f.name as string] })) });
  }

  getValue(): Record<string, unknown> {
    return this.form.getValues();
  }

  setValue(val: Record<string, unknown>) {
    for (const name in val) {
      this.form.setValue(name, val[name]);
    }
  }
}

registerFieldType("group", (config) => new GroupField(config));
