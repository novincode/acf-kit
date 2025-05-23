import type { FieldConfig, InferFormValues, GroupFieldConfig } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export class GroupField<TFields extends readonly FieldConfig<TValues>[], TValues> extends Field<GroupFieldConfig<TFields, TValues>, InferFormValues<TFields>, TValues> {
  form: Form;
  constructor(config: GroupFieldConfig<TFields, TValues>) {
    super(config);
    this.form = new Form({
      fields: [...config.fields] // Convert readonly array to mutable
    });
  }
  getValue(): InferFormValues<TFields> {
    return this.form.getValues() as InferFormValues<TFields>;
  }
  setValue(val: InferFormValues<TFields>): void {
    for (const name in val) {
      this.form.setValue(name, val[name]);
    }
    this.emitChange();
  }
}

registerFieldType("group", ((config) => {
  const typedConfig = config as GroupFieldConfig<any, any>;
  return new GroupField<any, any>(typedConfig);
}));
