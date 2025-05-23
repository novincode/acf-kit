import type { FieldConfig, InferFormValues } from "./types";
import { Field } from "./fieldBase";
import { registerFieldType } from "./registry";
import { Form } from "../form";

export interface FlexibleLayout<Fields extends readonly FieldConfig<Record<string, unknown>>[]> {
  name: string;
  label: string;
  fields: Fields;
}

// Explicit value shape for flexible fields with stronger typing
export interface FlexibleItemValue<Fields extends readonly FieldConfig<Record<string, unknown>>[]> {
  layout: string;
  values: InferFormValues<Fields>;
}

export type FlexibleFieldConfig<Layouts extends readonly FlexibleLayout<FieldConfig<Record<string, unknown>>[]>[], TValues> = {
  type: "flexible";
  name: string;
  label?: string;
  required?: boolean;
  layouts: Layouts;
  minRows?: number;
  maxRows?: number;
  defaultValue?: Array<FlexibleItemValue<Layouts[number]["fields"]>>;
  visibleIf?: (values: TValues) => boolean;
  validate?: (value: Array<FlexibleItemValue<Layouts[number]["fields"]>>, values: TValues) => string | undefined | Promise<string | undefined>;
};

export class FlexibleField<TLayouts extends readonly FlexibleLayout<FieldConfig<Record<string, unknown>>[]>[], TValues> extends Field<
  FlexibleFieldConfig<TLayouts, TValues>, 
  Array<FlexibleItemValue<TLayouts[number]["fields"]>>, 
  TValues
> {
  items: { layout: string; form: Form<Record<string, unknown>> }[];

  constructor(config: FlexibleFieldConfig<TLayouts, TValues>) {
    super(config);
    this.items = (config.defaultValue || []).map((item) => {
      const layout = [...config.layouts].find((l) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form<Record<string, unknown>>({ 
          fields: layout?.fields ? [...layout.fields] : [] 
        })
      };
    });
    this.enforceRowLimits();
  }

  addItem(layoutName: string) {
    const layout = [...this.config.layouts].find((l) => l.name === layoutName);
    if (!layout) throw new Error(`Unknown layout: ${layoutName}`);
    this.items.push({ 
      layout: layoutName, 
      form: new Form<Record<string, unknown>>({ 
        fields: layout.fields ? [...layout.fields] : [] 
      }) 
    });
    this.enforceRowLimits();
    this.emitChange();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.enforceRowLimits();
    this.emitChange();
  }

  getValue(): Array<FlexibleItemValue<TLayouts[number]["fields"]>> {
    return this.items.map(item => ({
      layout: item.layout,
      values: { ...item.form.getValues() }
    } as FlexibleItemValue<TLayouts[number]["fields"]>));
  }

  setValue(value: Array<FlexibleItemValue<TLayouts[number]["fields"]>>) {
    this.items = value.map((item) => {
      const layout = [...this.config.layouts].find((l) => l.name === item.layout);
      return {
        layout: item.layout,
        form: new Form<Record<string, unknown>>({ 
          fields: layout?.fields ? [...layout.fields] : [] 
        })
      };
    });
    this.enforceRowLimits();
    this.emitChange();
  }

  private enforceRowLimits() {
    const { minRows, maxRows } = this.config;
    if (typeof minRows === "number" && this.items.length < minRows) {
      const firstLayoutName = this.config.layouts[0]?.name;
      if (firstLayoutName) {
        while (this.items.length < minRows) {
          const layout = [...this.config.layouts].find((l) => l.name === firstLayoutName);
          if (layout) {
            this.items.push({ 
              layout: firstLayoutName, 
              form: new Form<Record<string, unknown>>({ 
                fields: layout.fields ? [...layout.fields] : [] 
              }) 
            });
          } else {
            break; // Avoid infinite loop if layout not found
          }
        }
      }
    }
    if (typeof maxRows === "number" && this.items.length > maxRows) {
      this.items.length = maxRows;
    }
  }
}

registerFieldType("flexible", ((config) => {
  const typedConfig = config as FlexibleFieldConfig<any, any>;
  return new FlexibleField<any, any>(typedConfig);
}));
