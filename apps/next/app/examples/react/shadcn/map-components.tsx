// Centralized mapping for field types to components for shadcn example
import { FieldComponentProps, FieldComponentMap } from "@acf-kit/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as React from "react";

export function ShadcnInput(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        value={(value as string) || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

export function ShadcnNumber(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        type="number"
        value={(value as number) ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(Number(e.target.value) as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

export function ShadcnTextarea(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Textarea
        value={(value as string) || ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set(e.target.value as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

export function ShadcnGroup(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2">{field?.config?.label || name}</div>
      {children}
    </Card>
  );
}

export function ShadcnRepeater(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2 flex items-center justify-between">
        {field?.config?.label || name}
        {typeof field === "object" && field !== null && "addRow" in field && typeof (field as any).addRow === "function" && (
          <Button type="button" size="sm" onClick={() => (field as any).addRow()}>Add</Button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export function ShadcnFlexible(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2 flex items-center justify-between">
        {field?.config?.label || name}
        {typeof field === "object" && field !== null && "addLayout" in field && typeof (field as any).addLayout === "function" &&
          "config" in field && typeof (field as any).config === "object" && (field as any).config !== null &&
          "layouts" in (field as any).config && Array.isArray((field as any).config.layouts) && (
            <div className="flex gap-2">
              {(field as any).config.layouts.map((layout: any) => (
                <Button key={layout.name} type="button" size="sm" onClick={() => (field as any).addLayout(layout.name)}>
                  Add {layout.label}
                </Button>
              ))}
            </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export const shadcnFieldMapping: FieldComponentMap = {
  text: ShadcnInput,
  textarea: ShadcnTextarea,
  number: ShadcnNumber,
  group: ShadcnGroup,
  repeater: ShadcnRepeater,
  flexible: ShadcnFlexible,
};
