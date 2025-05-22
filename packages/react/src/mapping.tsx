import React from "react";
import type { Field } from "@acf-kit/core";

// Props for each mapped field component
export type FieldComponentProps<T = any> = {
  field: Field<T, any>;
  value: T | undefined;
  set: (val: T) => void;
  error?: string;
  name: string;
};

// The shape of the mapping object
export type FieldComponentMap = {
  [fieldType: string]: React.ComponentType<FieldComponentProps<any>>;
};
