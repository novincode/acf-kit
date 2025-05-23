export * from "./mapping";
export * from "./AcfFormRenderer";
export { AcfFormContext, AcfFormProvider, useAcfForm } from "./context";
export { useAcfField } from "./useAcfField";
export { useAcfFields } from "./useAcfFields";
export {
  // Core engine
  Form,
  createFields,
  defineFields,
  registerAllBuiltins,
  registerFieldType,
  Field,
  GroupField,
  RepeaterField,
  FlexibleField,
  // Plugin/Registry
  listFieldTypes,
  createField,
  // Event Emitter
  EventEmitter,
  // Error classes
  AcfKitError,
  FieldTypeError,
  FormConfigError
} from "@acf-kit/core";

export type {
  FieldConfig,
  FieldTypeMap,
  BaseFieldConfig,
  GroupFieldConfig,
  RepeaterFieldConfig,
  FlexibleFieldConfig,
  OptionType,
  FormErrors,
  FieldInstances,
  FieldType
} from "@acf-kit/core";

// Future: useAcfForm, easy renderer, etc.
