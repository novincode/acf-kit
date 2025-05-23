import React from "react";
import type { Field, FieldConfig } from "@acf-kit/core";

// Props for each mapped field component - with improved generic handling
export type FieldComponentProps<T = unknown, TValues = Record<string, unknown>> = {
  field: Field<FieldConfig<TValues>, T, TValues>;
  value: T | undefined;
  set: (val: T) => void;
  error?: string;
  name: string;
};

// Make the mapping support any value type but keep the TValues consistent
export type FieldComponentMap = {
  [fieldType: string]: React.ComponentType<FieldComponentProps<any, any>>;
};
