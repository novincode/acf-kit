"use client";
import * as React from "react";
import { useState } from "react";
import {
  Form,
  registerAllBuiltins,
  createFields,
  AcfFormProvider,
  AcfFormRenderer,
  FieldComponentMap,
  useAcfField,
  FieldComponentProps
} from "@acf-kit/react";
import { shadcnFieldMapping } from "./map-components";
import { Button } from "@/components/ui/button";

registerAllBuiltins();

function UsernamePreview(): React.ReactNode {
  const { value } = useAcfField<any, any>("username");
  if (!value) return null;
  return <div className="text-muted-foreground text-sm mb-2">Hello, <b>{value as string}</b> 👋</div>;
}


const mapping: FieldComponentMap = shadcnFieldMapping;

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
