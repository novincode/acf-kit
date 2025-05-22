import type { FieldConfig } from "./types";
import { Field } from "./index";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface FlexibleLayout {
  name: string;
  label: string;
  fields: FieldConfig[];
}

// Explicit value shape for flexible fields
export interface FlexibleItemValue {
  layout: string;
  values: Record<string, unknown>;
}

export interface FlexibleFieldConfig extends FieldConfig<FlexibleItemValue[], any> {
  type: "flexible";
  layouts: FlexibleLayout[];
  minRows?: number;
  maxRows?: number;
}

class FlexibleField extends Field<FlexibleItemValue[], any> {
  items: { layout: string; form: Form }[];

  constructor(config: FlexibleFieldConfig) {
    super(config);
    this.items = (config.defaultValue || []).map((item: FlexibleItemValue) => {
      const layout = (config.layouts as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map((f: FieldConfig) => ({ ...f, defaultValue: item.values?.[f.name] })) || [] })
      };
    });
    this.enforceRowLimits();
  }

  addItem(layoutName: string, defaults: Record<string, any> = {}) {
    const layout = (this.config.layouts as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === layoutName);
    if (!layout) throw new Error(`Unknown layout: ${layoutName}`);
    this.items.push({ layout: layoutName, form: new Form({ fields: layout.fields.map((f: FieldConfig) => ({ ...f, defaultValue: defaults[f.name] })) }) });
    this.enforceRowLimits();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.enforceRowLimits();
  }

  getValue(): FlexibleItemValue[] {
    return this.items.map((item) => ({
      layout: item.layout,
      values: item.form.getValues()
    }));
  }

  setValue(value: FlexibleItemValue[]) {
    const config = this.config as FlexibleFieldConfig;
    this.items = value.map((item: FlexibleItemValue) => {
      const layout = (config.layouts as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map((f: FieldConfig) => ({ ...f, defaultValue: item.values?.[f.name] })) || [] })
      };
    });
    this.enforceRowLimits();
  }

  private enforceRowLimits() {
    const { minRows, maxRows } = this.config as FlexibleFieldConfig;
    if (typeof minRows === "number" && this.items.length < minRows) {
      // Optionally, add default items or throw
    }
    if (typeof maxRows === "number" && this.items.length > maxRows) {
      this.items.length = maxRows;
    }
  }
}

registerFieldType("flexible", (config) => new FlexibleField(config));
