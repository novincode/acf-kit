import React from "react";
import type { Form } from "@acf-kit/core";
import { useAcfField } from "./useAcfField";
import type { FieldComponentMap, FieldComponentProps } from "./mapping";
import { AcfFormProvider } from "./context";

export type RenderFieldConfig = {
  name: string;
  label?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  render?: (props: FieldComponentProps<any, any>) => React.ReactNode;
  // Additional properties for field-specific configurations 
  // Use Record instead of index signatures for better type safety
} & Record<string, unknown>;

// --- Advanced generic types for type-safe field/component mapping ---
type FieldName<TForm extends Form> = keyof TForm["fields"] & string;
type FieldInstanceFor<TForm extends Form, TName extends FieldName<TForm>> = TForm["fields"][TName];

export type AcfFormRendererProps<TForm extends Form = Form> = {
  form: TForm;
  mapping: FieldComponentMap;
  fields?: (FieldName<TForm> | RenderFieldConfig)[];
  wrapper?: (field: React.ReactNode, config: RenderFieldConfig, index: number) => React.ReactNode;
};

// Add type guards for group, repeater, flexible
// Type guards with improved types
import type { GroupField, RepeaterField, FlexibleField as FlexibleFieldType } from "@acf-kit/core";

function isGroupField(field: unknown): field is GroupField<any, any> {
  return !!field && typeof field === "object" && (field as any).form instanceof Object && typeof (field as any).form.getValues === "function";
}
function isRepeaterField(field: unknown): field is RepeaterField<any, any> {
  return !!field && typeof field === "object" && Array.isArray((field as any).forms);
}
function isFlexibleField(field: unknown): field is FlexibleFieldType<any, any> {
  return !!field && typeof field === "object" && Array.isArray((field as any).items);
}

export function AcfFormRenderer<TForm extends Form = Form>({ form, mapping, fields, wrapper }: AcfFormRendererProps<TForm>) {
  // Get normalized field configs
  const fieldConfigs: RenderFieldConfig[] = (fields ?? (Object.keys(form.fields) as FieldName<TForm>[])).map((f) =>
    typeof f === "string" ? { name: f } : f
  );

  return (
    <>
      {fieldConfigs.map((config, idx) => {
        const { name, label, width, className, style, render, ...rest } = config;
        // Always call the hook for every field
        const fieldHook = useAcfField(name as string);
        const field = fieldHook.field;
        const type = field.config.type as string;
        const Component = mapping[type];
        // Use a more specific type instead of any
        const props: FieldComponentProps<any, any> = {
          field,
          value: fieldHook.value,
          set: fieldHook.set,
          error: fieldHook.error,
          name,
          ...rest,
        };
        // Only render UI if field is visible
        if (!form.isFieldVisible(name as FieldName<TForm>)) return null;
        let rendered: React.ReactNode;
        if (render) {
          rendered = render(props);
        } else if (Component) {
          if (type === "group" && isGroupField(field)) {
            rendered = (
              <Component {...props}>
                <AcfFormProvider form={field.form}>
                  <AcfFormRenderer form={field.form} mapping={mapping} />
                </AcfFormProvider>
              </Component>
            );
          } else if (type === "repeater" && isRepeaterField(field)) {
            rendered = (
              <Component {...props}>
                {field.forms.map((subForm: Form, i: number) => (
                  <AcfFormProvider key={i} form={subForm}>
                    <AcfFormRenderer form={subForm} mapping={mapping} />
                  </AcfFormProvider>
                ))}
              </Component>
            );
          } else if (type === "flexible" && isFlexibleField(field)) {
            rendered = (
              <Component {...props}>
                {field.items.map((item, i) => (
                  <div key={i}>
                    <div>{item.layout}</div>
                    <AcfFormProvider form={item.form}>
                      <AcfFormRenderer form={item.form} mapping={mapping} />
                    </AcfFormProvider>
                  </div>
                ))}
              </Component>
            );
          } else {
            rendered = <Component {...props} />;
          }
        } else {
          rendered = <div>No component mapped for field type: {type}</div>;
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
