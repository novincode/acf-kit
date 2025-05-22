import { useContext, useEffect, useState } from "react";
import type { Field, Form } from "@acf-kit/core";
import { AcfFormContext } from "./context";

// Infer value type from schema
export type FieldValue<Schema, Name extends string> = Schema extends Record<Name, { value: infer V }> ? V : any;
export type FieldInstance<Schema, Name extends string> = Field<FieldValue<Schema, Name>, any>;

// Headless hook for a single field by name, with schema inference
export function useAcfField<
  Schema = any,
  Name extends string = string
>(fieldName: Name
): {
  value: FieldValue<Schema, Name>;
  set: (val: FieldValue<Schema, Name>) => void;
  field: FieldInstance<Schema, Name>;
  error?: string;
} {
  const form = useContext(AcfFormContext) as Form;
  if (!form) throw new Error("useAcfField must be used within an <AcfFormProvider>");
  const initialValue = form.getValue(fieldName);
  const [value, setValue] = useState<FieldValue<Schema, Name>>(initialValue !== undefined ? initialValue : null as any);
  const initialError = form.getErrors()[fieldName];
  const [error, setError] = useState<string | undefined>(initialError);

  useEffect(() => {
    const newValue = form.getValue(fieldName);
    setValue(newValue !== undefined ? newValue : null as any);
    setError(form.getErrors()[fieldName]);
    // Subscribe to live updates
    const onChange = (e: { name: string; value: FieldValue<Schema, Name> }) => {
      if (e.name === fieldName) setValue(e.value !== undefined ? e.value : null as any);
    };
    const onError = (e: { name: string; error: string | undefined }) => {
      if (e.name === fieldName) setError(e.error);
    };
    form.on("field:change", onChange);
    form.on("field:error", onError);
    return () => {
      form.off("field:change", onChange);
      form.off("field:error", onError);
    };
  }, [form, fieldName]);

  const set = (val: FieldValue<Schema, Name>) => {
    form.setValue(fieldName, val);
    // No need to set local state, will update via event
  };

  return {
    value,
    set,
    field: form.fields[fieldName] as FieldInstance<Schema, Name>,
    error,
  };
}
