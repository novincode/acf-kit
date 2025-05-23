import { useContext, useEffect, useState } from "react";
import { AcfFormContext } from "./context";
import type { Field, FieldConfig } from "@acf-kit/core";

// Headless hook for multiple fields (for groups, repeaters, etc)
export function useAcfFields<T = unknown, TValues = Record<string, unknown>>(fieldNames: string[]) {
  const form = useContext(AcfFormContext);
  if (!form) throw new Error("useAcfFields must be used within an <AcfFormProvider>");

  const [values, setValues] = useState<Record<string, T | undefined>>(() => {
    const out: Record<string, T | undefined> = {};
    for (const name of fieldNames) out[name] = form.getValue(name);
    return out;
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>(() => {
    const out: Record<string, string | undefined> = {};
    for (const name of fieldNames) out[name] = form.getErrors()[name];
    return out;
  });

  useEffect(() => {
    // Initial sync
    const newVals: Record<string, T | undefined> = {};
    const newErrs: Record<string, string | undefined> = {};
    for (const name of fieldNames) {
      newVals[name] = form.getValue(name);
      newErrs[name] = form.getErrors()[name];
    }
    setValues(newVals);
    setErrors(newErrs);
    // Subscribe to changes
    const onChange = (e: { name: string; value: unknown }) => {
      if (fieldNames.includes(e.name)) setValues(v => ({ ...v, [e.name]: e.value as T }));
    };
    const onError = (e: { name: string; error: string | undefined }) => {
      if (fieldNames.includes(e.name)) setErrors(er => ({ ...er, [e.name]: e.error }));
    };
    form.on("field:change", onChange);
    form.on("field:error", onError);
    return () => {
      form.off("field:change", onChange);
      form.off("field:error", onError);
    };
  }, [form, fieldNames.join(",")]);

  const set = (name: string, val: T) => {
    form.setValue(name, val);
  };

  return {
    values,
    set,
    errors,
    fields: fieldNames.map(name => form.fields[name] as Field<FieldConfig<TValues>, T, TValues>),
  };
}
