import type { FieldConfig, InferFormValues } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

// Explicit value shape for group fields
export interface GroupFieldConfig<Fields extends readonly FieldConfig[] = FieldConfig[]> extends FieldConfig<InferFormValues<Fields>, any, InferFormValues<Fields>> {
  type: "group";
  fields: Fields;
}

export class GroupField<Fields extends readonly FieldConfig[] = FieldConfig[]> extends Field<InferFormValues<Fields>, any> {
  form: Form;
  constructor(config: GroupFieldConfig<Fields>) {
    super(config);
    this.form = new Form({
      fields: config.fields.map(f => ({
        ...f,
        defaultValue: config.defaultValue?.[f.name as keyof InferFormValues<Fields>]
      }))
    });
  }
  getValue(): InferFormValues<Fields> {
    return this.form.getValues() as InferFormValues<Fields>;
  }
  setValue(val: InferFormValues<Fields>) {
    for (const name in val) {
      this.form.setValue(name, val[name]);
    }
    this.emitChange();
  }
}

registerFieldType("group", (config) => new GroupField(config));
