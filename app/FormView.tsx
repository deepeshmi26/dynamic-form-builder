"use client";

import { FormBuilder } from "@/components/dynamic-form-builder/FormBuilder";
import { FormFieldConfig } from "@/components/dynamic-form-builder/types";
import { Button } from "@/components/ui/button";
import { FieldValues } from "react-hook-form";
import { ArrayInlineAdapter } from "./Adapter";

export function FormView({ config }: { config: FormFieldConfig[] }) {
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

  return (
    <FormBuilder
      adapter={{
        ARRAY_INLINE: (props) => {
          return (
            <ArrayInlineAdapter
              name={props.name || ""}
              structure={props.structure || []}
              path={props.path || ""}
            />
          );
        },
      }}
      config={config}
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
