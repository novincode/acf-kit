import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface GroupFieldConfig extends FieldConfig<Record<string, any>, any> {
  type: "group";
  fields: FieldConfig[];
}

class GroupField extends Field<Record<string, any>, any> {
  form: Form;

  constructor(config: GroupFieldConfig) {
    super(config);
    this.form = new Form({ fields: config.fields.map(f => ({ ...f, defaultValue: config.defaultValue?.[f.name] })) });
  }

  getValue() {
    return this.form.getValues();
  }

  setValue(val: Record<string, any>) {
    for (const name in val) {
      this.form.setValue(name, val[name]);
    }
  }
}

registerFieldType("group", (config) => new GroupField(config));
