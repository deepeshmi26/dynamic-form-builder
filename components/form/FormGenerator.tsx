"use client";

import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useCallback, useRef } from "react";
import {
  Control,
  DefaultValues,
  FieldPath,
  FieldValues,
  Path,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { z } from "zod";
import { FormItemComponent } from "./FormComponent";
import { FormFieldConfig, FormItemType } from "./types";
import { ZodValidator } from "./resolvers";

type Props<TFieldValues extends FieldValues> = {
  config: (Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> })[];
  onSubmit?: SubmitHandler<TFieldValues>;
  adapter?: Record<
    string,
    React.ComponentType<{
      value?: unknown;
      onChange?: (value: unknown) => void;
      [key: string]: unknown;
    }>
  >;
  initialValues?: DefaultValues<TFieldValues>;
};

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
  children,
  adapter,
  initialValues,
}: React.PropsWithChildren<Props<TFieldValues>>) {
  const form = useForm<TFieldValues>({
    defaultValues: initialValues,
    mode: "onChange",
    resolver: zodResolver(
      new ZodValidator().generateSchema(config)
    ) as Resolver<TFieldValues>,
  });

  const registry = useRef<FormRegistryContextType<TFieldValues>["registry"]>(
    {} as FormRegistryContextType<TFieldValues>["registry"]
  );

  const handleSubmit: SubmitHandler<TFieldValues> = (values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const updateState = useCallback(
    (newConfig: Omit<FormFieldConfig, "name"> & { name: string }) => {
      if (registry.current) {
        const { name, ...rest } = newConfig;
        registry.current[name]?.setState(rest);
      }
    },
    []
  );

  const register = useCallback(
    (
      name: string,
      config: Omit<FormFieldConfig, "name"> & { name: string },
      setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
    ) => {
      if (registry.current) {
        registry.current[name as string] = {
          config: config as Omit<FormFieldConfig, "name"> & {
            name: FieldPath<TFieldValues>;
          },
          setState: setStateCall,
        } as TFieldValues[keyof TFieldValues];
      }
    },
    []
  );

  return (
    <Form {...form}>
      <FormRegistryContext.Provider
        value={{
          registry: registry.current,
          register: register,
          adapter: {
            ...adapter,
          },
          updateState: updateState,
        }}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {config.map((field) => (
            <FormItemComponent
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
