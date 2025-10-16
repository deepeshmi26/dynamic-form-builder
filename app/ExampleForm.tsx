"use client";

import configJson from "./config.json";
import { FormGenerator } from "@/components/form/FormGenerator";
import { FormFieldConfig } from "@/components/form/types";

export function ExampleForm() {
  const config = configJson as FormFieldConfig[];
  return <FormGenerator config={config} />;
}
