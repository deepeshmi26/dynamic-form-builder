"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createContext, useRef } from "react";
import { FieldPath, FieldValues, Path, useForm } from "react-hook-form";
import { FormItemComponent } from "./FormComponent";
import { FormFieldConfig, FormItemType } from "./types";

type Props<TFieldValues extends FieldValues> = {
  config: (Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> })[];
  onSubmit?: (values: TFieldValues) => void;
};

//Todo: Fix the types to work seamlessly with the react hook form
type FormRegistryContextType<TFieldValues extends FieldValues> = {
  register?: (
    name: Path<TFieldValues>,
    config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> },
    setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
  ) => void;
  registry?: Record<string, TFieldValues[keyof TFieldValues]>;
  updateState?: (
    newConfig: Omit<FormFieldConfig, "name"> & {
      name: string;
    }
  ) => void;
  adapter?: Record<
    string,
    React.ComponentType<{
      value?: unknown;
      onChange?: (value: unknown) => void;
      [key: string]: unknown;
    }>
  >;
};

export const FormRegistryContext = createContext<
  FormRegistryContextType<FieldValues>
>({});

export function FormGenerator<TFieldValues extends FieldValues>({
  config,
  onSubmit,
}: Props<TFieldValues>) {
  const form = useForm<TFieldValues>();

  const registry = useRef<FormRegistryContextType<TFieldValues>["registry"]>(
    {} as FormRegistryContextType<TFieldValues>["registry"]
  );

  const handleSubmit = (values: TFieldValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log(values);
    }
  };

  const updateState = (
    newConfig: Omit<FormFieldConfig, "name"> & { name: string }
  ) => {
    if (registry.current) {
      const { name, ...rest } = newConfig;
      registry.current[name]?.setState(rest);
    }
  };

  return (
    <Form {...form}>
      <FormRegistryContext.Provider
        value={{
          registry: registry.current,
          register: (name, config, setStateCall) => {
            if (registry.current) {
              registry.current[name as string] = {
                config: config as Omit<FormFieldConfig, "name"> & {
                  name: FieldPath<TFieldValues>;
                },
                setState: setStateCall as TFieldValues[keyof TFieldValues],
              } as TFieldValues[keyof TFieldValues];
            }
          },
          adapter: {
            [FormItemType.TEXT]: () => <>Hello world</>,
          },
          updateState: updateState,
        }}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {config.map((field) => (
            <FormItemComponent
              key={field.name}
              control={form.control}
              config={field}
            />
          ))}
          <div className="flex">
            <Button type="submit" className="w-full sm:w-auto">
              Submit
            </Button>
          </div>
          <div className="flex">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() =>
                updateState({
                  name: "name",
                  label: "First Name",
                  type: FormItemType.TEXT,
                })
              }
            >
              Test registry by updating state type of name item label to First
              Name
            </Button>
          </div>
        </form>
      </FormRegistryContext.Provider>
    </Form>
  );
}
