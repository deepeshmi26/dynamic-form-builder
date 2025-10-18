"use client";

import { FormBuilder } from "@/components/dynamic-form-builder/FormBuilder";
import { FormConfig } from "@/components/dynamic-form-builder/types";
import { Button } from "@/components/ui/button";
import { FieldValues } from "react-hook-form";
import { SpecialTextFormField } from "./Adapter";

export function FormView({ config }: { config: FormConfig }) {
  const handleSubmit = (values: FieldValues) => {
    console.log(values);
  };

  const onChange = (
    fieldName: string,
    value: unknown,
    allValues: FieldValues
  ) => {
    console.log(`Field "${fieldName}" changed to:`, value);
    console.log("All form values:", allValues);
  };

  if (!config) {
    return null;
  }

  return (
    <FormBuilder
      key={JSON.stringify(config)}
      adapter={{
        SPECIAL_INPUT: (props) => {
          return <SpecialTextFormField {...props} />;
        },
      }}
      formConfig={config}
      onSubmit={handleSubmit}
      onChange={onChange}
    >
      <div className="flex">
        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
      </div>
    </FormBuilder>
  );
}
