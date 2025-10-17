"use client";

import { Form } from "@/components/ui/form";
import { Control, FieldValues } from "react-hook-form";
import { FormField } from "./FormField";
import { FormGenratorProps } from "./types";
import { useFormBuilder } from "./hooks/useFormBuilder";
import { FormRegistryContext } from "./hooks/useFormRegistryContext";

export function FormBuilder<TFieldValues extends FieldValues>(
  props: React.PropsWithChildren<FormGenratorProps<TFieldValues>>
) {
  const { form, handleSubmit, contextValue } =
    useFormBuilder<TFieldValues>(props);
  const { config, children } = props;

  return (
    <Form {...form}>
      <FormRegistryContext.Provider value={contextValue}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {config.map((field) => (
            <FormField
              key={field.name}
              control={form.control as Control<TFieldValues>}
              config={field}
            />
          ))}
          {children}
        </form>
      </FormRegistryContext.Provider>
    </Form>
  );
}
