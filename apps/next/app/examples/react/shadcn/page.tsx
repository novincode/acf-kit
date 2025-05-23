"use client";
import * as React from "react";
import { useState } from "react";
import { Form } from "@acf-kit/core";
import type { Form as FormType } from "@acf-kit/core";
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
import { createFields } from "@acf-kit/core/fields/types";

registerAllBuiltins();

// Type-safe component definitions
function ShadcnInput(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        value={(value as string) || ""}
        onChange={e => set(e.target.value as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function ShadcnNumber(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Input
        type="number"
        value={(value as number) ?? ""}
        onChange={e => set(Number(e.target.value) as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function ShadcnTextarea(props: FieldComponentProps<any, any>): React.ReactNode {
  const { value, set, error, field } = props;
  return (
    <div className="mb-4">
      <Textarea
        value={(value as string) || ""}
        onChange={e => set(e.target.value as any)}
        placeholder={field?.config?.label || ""}
        aria-invalid={!!error}
      />
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
}

function UsernamePreview(): React.ReactNode {
  const { value } = useAcfField<any, any>("username");
  if (!value) return null;
  return <div className="text-muted-foreground text-sm mb-2">Hello, <b>{value as string}</b> 👋</div>;
}

// Type guards for field types
function isRepeaterField(field: unknown): field is { addRow: () => void } {
  return typeof field === "object" && field !== null && "addRow" in field && typeof (field as any).addRow === "function";
}

function isFlexibleField(field: unknown): field is { addLayout: (name: string) => void, config: { layouts: any[] } } {
  return typeof field === "object" && 
         field !== null && 
         "addLayout" in field && 
         typeof (field as any).addLayout === "function" && 
         "config" in field &&
         typeof (field as any).config === "object" &&
         (field as any).config !== null &&
         "layouts" in (field as any).config &&
         Array.isArray((field as any).config.layouts);
}

function ShadcnGroup(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
  const { field, name, children } = props;
  return (
    <Card className="mb-4 p-4">
      <div className="font-semibold mb-2">{field?.config?.label || name}</div>
      {children}
    </Card>
  );
}

function ShadcnRepeater(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
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

function ShadcnFlexible(props: FieldComponentProps<any, any> & { children?: React.ReactNode }): React.ReactNode {
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

// Define the form values type structure
type FormValues = {
  username: string;
  bio: string;
  age: number;
  profile: {
    website: string;
    location: string;
  };
  tags: Array<{
    label: string;
  }>;
  content: Array<{
    layout: string;
    values: Record<string, unknown>;
  }>;
};

// Create type-safe field definitions
const fields = createFields<FormValues>()([
  { 
    name: "username", 
    type: "text", 
    label: "Username", 
    required: true,
    validate: (value: string) => {
      if (!value || value.trim().length < 3) {
        return "Username must be at least 3 characters";
      }
      return undefined;
    }
  },
  { 
    name: "bio", 
    type: "textarea", 
    label: "Bio", 
    visibleIf: (values: FormValues) => !!values.username 
  },
  { 
    name: "age", 
    type: "number", 
    label: "Age", 
    validate: (value: number) => {
      if (typeof value === "number" && value < 0) {
        return "Age cannot be negative!";
      }
      if (typeof value === "number" && value > 150) {
        return "Age seems unrealistic!";
      }
      return undefined;
    }
  },
  {
    name: "profile",
    type: "group",
    label: "Profile Information",
    fields: [
      { name: "website", type: "text", label: "Website URL" },
      { name: "location", type: "text", label: "Location" },
    ] as const,
  },
  {
    name: "tags",
    type: "repeater",
    label: "Tags",
    minRows: 0,
    maxRows: 10,
    fields: [
      { name: "label", type: "text", label: "Tag Name", required: true },
    ] as const,
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
          { name: "text", type: "textarea", label: "Text Content" },
        ] as const,
      },
      {
        name: "imageBlock",
        label: "Image Block",
        fields: [
          { name: "url", type: "text", label: "Image URL" },
          { name: "alt", type: "text", label: "Alt Text" },
        ] as const,
      },
    ] as const,
  },
] as const);

// Create the form instance
const form = new Form({ fields: [...fields] });

export default function ShadcnAcfKitExample(): React.ReactNode {
  const [rerender, setRerender] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate the form
    const isValid = form.validate();
    if (!isValid) {
      setRerender(x => x + 1); // Force re-render to show validation errors
      return;
    }

    // Get form values in a type-safe way
    const values = form.getValues();
    alert("Form submitted successfully!\n" + JSON.stringify(values, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <AcfFormProvider form={form as any}>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
          <h2 className="font-bold text-2xl mb-6">🚀 Type-Safe ACF-Kit + shadcn/ui</h2>
          <p className="text-muted-foreground mb-6">
            This example demonstrates the fully type-safe ACF-Kit core with shadcn/ui components.
          </p>
          
          <UsernamePreview />
          
          <AcfFormRenderer
            form={form as any}
            mapping={mapping}
            wrapper={(field, config) => (
              <div key={config.name} className="mb-5">
                <label className="block text-sm font-medium mb-2">
                  {config.label}
                  {(config as any).required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field}
              </div>
            )}
          />
          
          <div className="flex gap-4 mt-8">
            <Button type="submit" className="flex-1">
              Submit Form
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                console.log("Current form values:", form.getValues());
                setRerender(x => x + 1);
              }}
            >
              Debug Values
            </Button>
          </div>
        </form>
      </AcfFormProvider>
    </div>
  );
}
