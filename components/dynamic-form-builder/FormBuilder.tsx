"use client";

import { Form } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { useFormBuilder } from "./hooks/useFormBuilder";
import { FormRegistryContext } from "./hooks/useFormRegistryContext";
import {
  FormFieldConfig,
  FormProps,
  FormRegistryContext as FormRegistryContextType,
} from "./types";
import { cn } from "@/lib/utils";

export function FormBuilder<T extends FieldValues>(
  props: React.PropsWithChildren<FormProps<T>>
) {
  const { form, handleSubmit, contextValue } = useFormBuilder<T>(props);
  const { formConfig: config, children } = props;
  const { settings } = config;
  const layout = settings?.layout || "vertical";

  return (
    <Form {...form}>
      <FormRegistryContext.Provider
        value={contextValue as unknown as FormRegistryContextType<FieldValues>}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className={cn("space-y-4", settings?.className)}>
            {config.fields?.map((field: FormFieldConfig) => (
              <FormField
                key={field.name}
                settings={settings || {}}
                control={form.control as Control<T>}
                field={field as FormFieldConfig & { name: Path<T> }}
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
