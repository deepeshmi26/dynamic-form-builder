"use client";

import { Form } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { useFormBuilder } from "./hooks/useFormBuilder";
import { FormRegistryContext } from "./hooks/useFormRegistryContext";
import { FormFieldConfig, FormGenratorProps } from "./types";
import { cn } from "@/lib/utils";

export function FormBuilder<TFieldValues extends FieldValues>(
  props: React.PropsWithChildren<FormGenratorProps<TFieldValues>>
) {
  const { form, handleSubmit, contextValue } =
    useFormBuilder<TFieldValues>(props);
  const { formConfig: config, children } = props;
  const { settings } = config;
  const layout = settings?.layout || "vertical";

  return (
    <Form {...form}>
      <FormRegistryContext.Provider value={contextValue}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            {config.fields?.map((field: FormFieldConfig) => (
              <FormField
                key={field.name}
                settings={settings}
                control={form.control as Control<TFieldValues>}
                field={
                  field as Omit<FormFieldConfig, "name"> & {
                    name: Path<TFieldValues>;
                  }
                }
              />
            ))}
          </div>
          <div
            className={cn(
              "flex justify-start",
              layout === "horizontal" && "sm:ml-[33.333333%] sm:pl-4"
            )}
          >
            {children}
          </div>
        </form>
      </FormRegistryContext.Provider>
    </Form>
  );
}
