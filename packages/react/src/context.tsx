import { createContext, useContext, ReactNode } from "react";
import type { Form } from "@acf-kit/core";

// React context for the current ACF Form instance
export const AcfFormContext = createContext<Form | null>(null);

export function AcfFormProvider({ form, children }: { form: Form; children: ReactNode }) {
  return <AcfFormContext.Provider value={form}>{children}</AcfFormContext.Provider>;
}

export function useAcfForm() {
  const form = useContext(AcfFormContext);
  if (!form) throw new Error("useAcfForm must be used within an <AcfFormProvider>");
  return form;
}

// Optionally, re-export useAcfField or keep it in index.tsx
export { useAcfField } from "./useAcfField";
