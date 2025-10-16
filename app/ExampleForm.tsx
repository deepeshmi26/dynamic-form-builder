"use client";

import configJson from "./config.json";
import { FormGenerator } from "@/components/form/FormGenerator";
import { FormFieldConfig } from "@/components/form/types";
import { Button } from "@/components/ui/button";
import { FieldValues } from "react-hook-form";

export function ExampleForm() {
  const config = configJson as FormFieldConfig[];
  const handleSubmit = (values: FieldValues) => {
    console.log(values);
  };
  return (
    <FormGenerator config={config} onSubmit={handleSubmit}>
      <div className="flex">
        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
      </div>
    </FormGenerator>
  );
}
