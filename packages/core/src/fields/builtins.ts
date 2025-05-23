import type { BaseFieldConfig } from "./types";
import { Field } from "./fieldBase";
import { fieldRegistry, registerFieldType } from "./registry";
import { GroupField } from "./group";
import { RepeaterField } from "./repeater";
import { FlexibleField } from "./flexible";

// --- Modular built-in field registration for tree-shaking ---
export function registerTextField() {
  registerFieldType("text", (config) => {
    const typedConfig = config as BaseFieldConfig<"text", string, any>;
    return new Field<BaseFieldConfig<"text", string, any>, string, any>(typedConfig);
  });
}

export function registerNumberField() {
  registerFieldType("number", (config) => {
    const typedConfig = config as BaseFieldConfig<"number", number, any>;
    return new Field<BaseFieldConfig<"number", number, any>, number, any>(typedConfig);
  });
}

export function registerBooleanField() {
  registerFieldType("boolean", (config) => {
    const typedConfig = config as BaseFieldConfig<"boolean", boolean, any>;
    return new Field<BaseFieldConfig<"boolean", boolean, any>, boolean, any>(typedConfig);
  });
}

export function registerDateField() {
  registerFieldType("date", (config) => {
    const typedConfig = config as BaseFieldConfig<"date", string, any>;
    return new Field<BaseFieldConfig<"date", string, any>, string, any>(typedConfig);
  });
}

export function registerTextareaField() {
  registerFieldType("textarea", (config) => {
    const typedConfig = config as BaseFieldConfig<"textarea", string, any>;
    return new Field<BaseFieldConfig<"textarea", string, any>, string, any>(typedConfig);
  });
}

// --- Register all built-ins at once (for convenience) ---
export function registerAllBuiltins() {
  registerTextField();
  registerTextareaField();
  registerNumberField();
  registerBooleanField();
  registerDateField();
  
  // Group field is already registered in its own file
  // Repeater field is already registered in its own file
  // Flexible field is already registered in its own file
}