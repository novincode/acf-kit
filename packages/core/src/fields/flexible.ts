import type { FieldConfig, InferFormValues } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface FlexibleLayout<Fields extends readonly FieldConfig[] = FieldConfig[]> {
  name: string;
  label: string;
  fields: Fields;
}

// Explicit value shape for flexible fields
export interface FlexibleItemValue<Fields extends readonly FieldConfig[] = FieldConfig[]> {
  layout: string;
  values: InferFormValues<Fields>;
}

export interface FlexibleFieldConfig<Layouts extends readonly FlexibleLayout[] = FlexibleLayout[]> extends FieldConfig<FlexibleItemValue[], any, any> {
  type: "flexible";
  layouts: Layouts;
  minRows?: number;
  maxRows?: number;
}

export class FlexibleField<Layouts extends readonly FlexibleLayout[] = FlexibleLayout[]> extends Field<FlexibleItemValue[], any> {
  items: { layout: string; form: Form }[];

  constructor(config: FlexibleFieldConfig<Layouts>) {
    super(config);
    this.items = (config.defaultValue || []).map((item: FlexibleItemValue) => {
      const layout = (config.layouts as unknown as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map((f: FieldConfig) => ({ ...f, defaultValue: item.values?.[f.name as keyof typeof item.values] })) || [] })
      };
    });
    this.enforceRowLimits();
  }

  addItem(layoutName: string, defaults: Record<string, any> = {}) {
    const layout = (this.config.layouts as unknown as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === layoutName);
    if (!layout) throw new Error(`Unknown layout: ${layoutName}`);
    this.items.push({ layout: layoutName, form: new Form({ fields: layout.fields.map((f: FieldConfig) => ({ ...f, defaultValue: defaults[f.name as keyof typeof defaults] })) }) });
    this.enforceRowLimits();
    this.emitChange();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.enforceRowLimits();
    this.emitChange();
  }

  getValue(): FlexibleItemValue[] {
    // Always return a new array reference
    return this.items.map(item => ({
      layout: item.layout,
      values: { ...item.form.getValues() }
    }));
  }

  setValue(value: FlexibleItemValue[]) {
    const config = this.config as FlexibleFieldConfig;
    this.items = value.map((item: FlexibleItemValue) => {
      const layout = (config.layouts as unknown as FlexibleLayout[]).find((l: FlexibleLayout) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form({ fields: layout?.fields.map((f: FieldConfig) => ({ ...f, defaultValue: item.values?.[f.name] })) || [] })
      };
    });
    this.enforceRowLimits();
    this.emitChange();
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
