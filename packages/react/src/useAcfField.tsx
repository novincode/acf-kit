import React, { useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { Field, Form, FieldConfig } from "@acf-kit/core";
import { AcfFormContext } from "./context";

// Infer value type from schema
export type FieldValue<Schema, Name extends string> = Schema extends Record<Name, { value: infer V }> ? V : unknown;
export type FieldInstance<Schema, Name extends string, TValues = Record<string, unknown>> = 
  Field<FieldConfig<TValues>, FieldValue<Schema, Name>, TValues>;

// Headless hook for a single field by name, with schema inference
// TValues parameter ensures proper type constraints throughout the form
export function useAcfField<
  Schema = Record<string, { value: unknown }>,
  Name extends string = string,
  TValues extends Record<string, unknown> = Record<string, unknown>
>(fieldName: Name
): {
  value: FieldValue<Schema, Name>;
  set: (val: FieldValue<Schema, Name>) => void;
  field: FieldInstance<Schema, Name, TValues>;
  error?: string;
} {
  const form = useContext(AcfFormContext) as Form;
  if (!form) throw new Error("useAcfField must be used within an <AcfFormProvider>");
  const field = form.fields[fieldName] as FieldInstance<Schema, Name>;
  if (!field) {
    throw new Error(`Field '${fieldName}' not found in form.`);
  }

  // --- Reactivity: subscribe to field changes ---
  const valueRef = React.useRef(field.getValue());

  const subscribe = (onStoreChange: () => void) => {
    const handler = () => {
      valueRef.current = field.getValue();
      onStoreChange();
    };
    field.onChange(handler);
    return () => field.offChange(handler);
  };
  const getSnapshot = () => valueRef.current;

  useSyncExternalStore(subscribe, getSnapshot, () => undefined);

  const set = (val: FieldValue<Schema, Name>) => {
    form.setValue(fieldName, val);
    // No need to set local state, will update via event
  };

  return {
    value: field.getValue(),
    set,
    field,
    error: form.getFieldError(fieldName),
  };
}
