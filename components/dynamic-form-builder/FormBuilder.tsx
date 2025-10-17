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
          <div
            className={cn(
              "grid gap-4 -mx-2",
              layout === "inline" && "grid-cols-12",
              layout !== "inline" && "grid-cols-1"
            )}
          >
            {config.fields?.map((field: FormFieldConfig) => {
              const widthClasses = {
                1: "col-span-1",
                2: "col-span-2",
                3: "col-span-3",
                4: "col-span-4",
                5: "col-span-5",
                6: "col-span-6",
                7: "col-span-7",
                8: "col-span-8",
                9: "col-span-9",
                10: "col-span-10",
                11: "col-span-11",
                12: "col-span-12",
              };

              return (
                <div
                  key={field.name}
                  className={cn(
                    "px-2",
                    layout === "inline" &&
                      field.width &&
                      widthClasses[field.width]
                  )}
                >
                  <FormField
                    settings={settings}
                    control={form.control as Control<TFieldValues>}
                    field={
                      field as Omit<FormFieldConfig, "name"> & {
                        name: Path<TFieldValues>;
                      }
                    }
                  />
                </div>
              );
            })}
          </div>
          <div
            className={cn(
              "flex justify-start px-2",
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
