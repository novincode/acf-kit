"use client";
import * as React from "react";
import { useState } from "react";
import { Form } from "@acf-kit/core";
import { registerAllBuiltins } from "@acf-kit/core/fields/builtins";
import {
  AcfFormProvider,
  AcfFormRenderer,
  FieldComponentMap,
  useAcfField,
} from "@acf-kit/react";
import type { FieldComponentProps } from "@acf-kit/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InferFormValues, FieldConfig } from "@acf-kit/core/fields/types";

registerAllBuiltins();

function ShadcnInput(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        value={value || ""}
        onChange={e => set(e.target.value)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function ShadcnNumber(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        type="number"
        value={value ?? ""}
        onChange={e => set(Number(e.target.value))}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function ShadcnTextarea(props: FieldComponentProps<any>) {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Textarea
        value={value || ""}
        onChange={e => set(e.target.value)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function UsernamePreview() {
  const { value } = useAcfField("username");
  if (!value) return null;
  return <div className="text-muted-foreground text-sm mb-2">Hello, <b>{value}</b> 👋</div>;
}

function isRepeaterField(field: any): field is { addRow: () => void } {
  return typeof field?.addRow === "function";
}
function isFlexibleField(field: any): field is { addLayout: (name: string) => void, config: { layouts: any[] } } {
  return typeof field?.addLayout === "function" && Array.isArray(field?.config?.layouts);
}

function ShadcnGroup(props: FieldComponentProps<Record<string, unknown>> & { children?: React.ReactNode }) {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2">{field?.config?.label || name}</div>
      {children}
    </Card>
  );
}

function ShadcnRepeater(props: FieldComponentProps<Record<string, unknown>[]> & { children?: React.ReactNode }) {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2 flex items-center justify-between">
        {field?.config?.label || name}
        {isRepeaterField(field) && (
          <Button type="button" size="sm" onClick={() => field.addRow()}>Add</Button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function ShadcnFlexible(props: FieldComponentProps<any> & { children?: React.ReactNode }) {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2 flex items-center justify-between">
        {field?.config?.label || name}
        {isFlexibleField(field) && (
          <div className="flex gap-2">
            {field.config.layouts.map((layout: any) => (
              <Button key={layout.name} type="button" size="sm" onClick={() => field.addLayout(layout.name)}>
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

const mapping: FieldComponentMap = {
  text: ShadcnInput,
  textarea: ShadcnTextarea,
  number: ShadcnNumber,
  group: ShadcnGroup,
  repeater: ShadcnRepeater,
  flexible: ShadcnFlexible,
};

const fields: FieldConfig[] = [
  { name: "username", type: "text", label: "Username", required: true },
  { name: "bio", type: "textarea", label: "Bio", visibleIf: (values: any) => !!values.username },
  { name: "age", type: "number", label: "Age", validate: (v: unknown) => typeof v === "number" && v < 0 ? "Negative age!" : undefined },
  {
    name: "profile",
    type: "group",
    label: "Profile",
    fields: [
      { name: "website", type: "text", label: "Website" },
      { name: "location", type: "text", label: "Location" },
    ],
  },
  {
    name: "tags",
    type: "repeater",
    label: "Tags",
    fields: [
      { name: "label", type: "text", label: "Tag Label" },
    ],
  },
  {
    name: "content",
    type: "flexible",
    label: "Content Blocks",
    layouts: [
      {
        name: "textBlock",
        label: "Text Block",
        fields: [
          { name: "text", type: "textarea", label: "Text" },
        ],
      },
      {
        name: "imageBlock",
        label: "Image Block",
        fields: [
          { name: "url", type: "text", label: "Image URL" },
        ],
      },
    ],
  },
];

type FormValues = InferFormValues<typeof fields>;

const form = new Form({ fields });

export default function ShadcnAcfKitExample() {
  const [rerender, setRerender] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.validate()) {
      setRerender(x => x + 1);
      return;
    }
    alert("Form submitted!\n" + JSON.stringify(form.getValues(), null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <AcfFormProvider form={form}>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
          <h2 className="font-bold text-2xl mb-6">🚀 acf-kit/react + shadcn Example Form</h2>
          <UsernamePreview />
          <AcfFormRenderer
            form={form}
            mapping={mapping}
            wrapper={(field, config) => (
              <div key={config.name} className="mb-5">{field}</div>
            )}
          />
          <Button type="submit" className="mt-6 w-full">Submit</Button>
        </form>
      </AcfFormProvider>
    </div>
  );
}
