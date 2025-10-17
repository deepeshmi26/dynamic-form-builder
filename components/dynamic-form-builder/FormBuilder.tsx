"use client";

import { Form } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { useFormBuilder } from "./hooks/useFormBuilder";
import { FormRegistryContext } from "./hooks/useFormRegistryContext";
import { FormFieldConfig, FormGenratorProps } from "./types";

export function FormBuilder<TFieldValues extends FieldValues>(
  props: React.PropsWithChildren<FormGenratorProps<TFieldValues>>
) {
  const { form, handleSubmit, contextValue } =
    useFormBuilder<TFieldValues>(props);
  const { formConfig: config, children } = props;
  const { settings } = config;
  return (
    <Form {...form}>
      <FormRegistryContext.Provider value={contextValue}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {config.fields?.map((field: FormFieldConfig) => (
            <FormField
              settings={settings}
              key={field.name}
              control={form.control as Control<TFieldValues>}
              field={
                field as Omit<FormFieldConfig, "name"> & {
                  name: Path<TFieldValues>;
                }
              }
            />
          ))}
          {children}
        </form>
      </FormRegistryContext.Provider>
    </Form>
  );
}
