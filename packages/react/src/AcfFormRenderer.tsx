import React from "react";
import type { Form } from "@acf-kit/core";
import { useAcfField } from "./useAcfField";
import type { FieldComponentMap, FieldComponentProps } from "./mapping";

export type RenderFieldConfig = {
  name: string;
  label?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  render?: (props: FieldComponentProps<any>) => React.ReactNode;
  [key: string]: any;
};

// --- Advanced generic types for type-safe field/component mapping ---
type FieldName<TForm extends Form> = keyof TForm["fields"] & string;
type FieldInstanceFor<TForm extends Form, TName extends FieldName<TForm>> = TForm["fields"][TName];

export type AcfFormRendererProps<TForm extends Form = Form> = {
  form: TForm;
  mapping: FieldComponentMap;
  fields?: (FieldName<TForm> | RenderFieldConfig)[];
  wrapper?: (field: React.ReactNode, config: RenderFieldConfig, index: number) => React.ReactNode;
};

// Type guards for nested field types
function isGroupField(field: any): field is { form: Form } {
  return !!field && typeof field === "object" && field.form instanceof Object && typeof field.form.getValues === "function";
}
function isRepeaterField(field: any): field is { forms: Form[] } {
  return !!field && typeof field === "object" && Array.isArray(field.forms);
}
function isFlexibleField(field: any): field is { items: { layout: string; form: Form }[] } {
  return !!field && typeof field === "object" && Array.isArray(field.items);
}

export function AcfFormRenderer<TForm extends Form = Form>({ form, mapping, fields, wrapper }: AcfFormRendererProps<TForm>) {
  // Get normalized field configs
  const fieldConfigs: RenderFieldConfig[] = (fields ?? (Object.keys(form.fields) as FieldName<TForm>[])).map((f) =>
    typeof f === "string" ? { name: f } : f
  );

  // Filter out invisible/disabled fields
  const visibleFieldConfigs = fieldConfigs.filter(cfg => {
    const name = cfg.name as FieldName<TForm>;
    return form.isFieldVisible(name) && form.isFieldEnabled(name);
  });

  return (
    <>
      {visibleFieldConfigs.map((config, idx) => {
        const { name, label, width, className, style, render, ...rest } = config;
        const field = form.fields[name as FieldName<TForm>];
        if (!field) return <div key={name}>Field "{name}" not found.</div>;
        const type = field.config.type as string;
        const Component = mapping[type];

        if (!Component && !render) {
          return <div key={name}>No component mapped for field type: {type}</div>;
        }

        // --- Strongly type the hook and props ---
        const fieldHook = useAcfField(name as string);
        const props: FieldComponentProps<any> = {
          field: fieldHook.field,
          value: fieldHook.value,
          set: fieldHook.set,
          error: fieldHook.error,
          name,
          ...rest,
        };

        let rendered: React.ReactNode;
        if (render) {
          rendered = render(props);
        } else if (type === "group" && isGroupField(field)) {
          rendered = (
            <AcfFormRenderer form={field.form} mapping={mapping} />
          );
        } else if (type === "repeater" && isRepeaterField(field)) {
          rendered = field.forms.map((subForm: Form, i: number) => {
            // Prefer a stable key if available (e.g., subForm._acfKey)
            const key = (subForm as any)._acfKey || i;
            return <AcfFormRenderer key={key} form={subForm} mapping={mapping} />;
          });
        } else if (type === "flexible" && isFlexibleField(field)) {
          rendered = field.items.map((item, i) => {
            // TODO: Use a stable key if available (e.g., item.id) in the future
            return (
              <div key={i}>
                <div>{item.layout}</div>
                <AcfFormRenderer form={item.form} mapping={mapping} />
              </div>
            );
          });
        } else {
          rendered = <Component {...props} />;
        }

        rendered = (
          <div
            key={name}
            className={className}
            style={{
              width,
              ...style,
            }}
          >
            {label && <label htmlFor={name}>{label}</label>}
            {rendered}
          </div>
        );

        return wrapper ? wrapper(rendered, config, idx) : rendered;
      })}
    </>
  );
}
