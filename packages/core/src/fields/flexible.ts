import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface FlexibleLayout {
  name: string;
  label: string;
  fields: FieldConfig[];
}

export interface FlexibleFieldConfig extends FieldConfig<any[], any> {
  type: "flexible";
  layouts: FlexibleLayout[];
  minRows?: number;
  maxRows?: number;
}

class FlexibleField extends Field<any[], any> {
  items: { layout: string; form: Form }[];

  constructor(config: FlexibleFieldConfig) {
    super(config);
    this.items = (config.defaultValue || []).map(item => {
      const layout = config.layouts.find(l => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map(f => ({ ...f, defaultValue: item.values?.[f.name] })) || [] })
      };
    });
  }

  addItem(layoutName: string, defaults: Record<string, any> = {}) {
    const layout = (this.config as FlexibleFieldConfig).layouts.find(l => l.name === layoutName);
    if (!layout) throw new Error(`Unknown layout: ${layoutName}`);
    this.items.push({ layout: layoutName, form: new Form({ fields: layout.fields.map(f => ({ ...f, defaultValue: defaults[f.name] })) }) });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  getValue() {
    return this.items.map(item => ({
      layout: item.layout,
      values: item.form.getValues()
    }));
  }

  setValue(value: any[]) {
    const config = this.config as FlexibleFieldConfig;
    this.items = value.map(item => {
      const layout = config.layouts.find(l => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map(f => ({ ...f, defaultValue: item.values?.[f.name] })) || [] })
      };
    });
  }
}

registerFieldType("flexible", (config) => new FlexibleField(config));
