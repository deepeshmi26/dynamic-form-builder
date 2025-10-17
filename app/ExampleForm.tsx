"use client";

import { FormGenerator } from "@/components/form/FormGenerator";
import { FormFieldConfig } from "@/components/form/types";
import { Button } from "@/components/ui/button";
import { FieldValues } from "react-hook-form";

export function ExampleForm({ config }: { config: FormFieldConfig[] }) {
  const handleSubmit = (values: FieldValues) => {
    console.log(values);
  };

  const handleGlobalChange = (
    fieldName: string,
    value: unknown,
    allValues: FieldValues
  ) => {
    console.log(`Field "${fieldName}" changed to:`, value);
    console.log("All form values:", allValues);
  };

  return (
    <FormGenerator
      config={config}
      onSubmit={handleSubmit}
      onChange={handleGlobalChange}
    >
      <div className="flex">
        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
      </div>
    </FormGenerator>
  );
}

export const sampleInitialValues = {
  name: "John Doe",
  contactDetails: [
    {
      email: "john@example.com",
      phone: "123-456-7890",
      socialMedia: [
        {
          platform: "ui",
        },
      ],
    },
  ],
  satisfaction: "4",
  improvements: "ui",
  subscribe: true,
};
