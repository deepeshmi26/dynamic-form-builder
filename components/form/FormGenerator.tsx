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
import { FormItemComponent } from "./FormComponent";
import { AjvValidator, ZodValidator } from "./resolvers";
import { FormFieldConfig } from "./types";

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
  onChange?: (
    fieldName: string,
    value: unknown,
    allValues: TFieldValues
  ) => void;
  registerOnChangeRecord?: (fieldConfig: FormFieldConfig) => void;
};

type RegistryEntry<TFieldValues extends FieldValues> = {
  config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> };
  initialConfig: Omit<FormFieldConfig, "name"> & {
    name: FieldPath<TFieldValues>;
  };
  setState: (state: unknown) => void;
};

type ChangeRule<TFieldValues extends FieldValues> = {
  if: object;
  then: Record<string, Partial<FormFieldConfig>>;
  else: Record<string, Partial<FormFieldConfig>>;
  target: Path<TFieldValues>;
};

type FormRegistryContextType<TFieldValues extends FieldValues> = {
  register?: (
    name: Path<TFieldValues>,
    config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> },
    setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
  ) => void;
  registry?: Record<string, RegistryEntry<TFieldValues>>;
  onChangeRecord?: Record<string, ChangeRule<TFieldValues>[]>;
  registerOnChangeRecord?: (fieldConfig: FormFieldConfig) => void;
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
  onChange?: (
    fieldName: string,
    value: unknown,
    allValues: TFieldValues
  ) => void;
};

export const FormRegistryContext = createContext<
  FormRegistryContextType<FieldValues>
>({});

function mergeDeep<TTarget extends Record<string, unknown>>(
  target: TTarget,
  ...sources: Record<string, unknown>[]
): TTarget {
  const output: Record<string, unknown> = { ...target };
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = output[key];
      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        output[key] = mergeDeep(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        output[key] = sourceValue;
      }
    }
  }
  return output as TTarget;
}

export function FormGenerator<TFieldValues extends FieldValues>({
  config,
  onSubmit,
  children,
  adapter,
  initialValues,
  onChange,
}: React.PropsWithChildren<Props<TFieldValues>>) {
  const form = useForm<TFieldValues>({
    defaultValues: initialValues,
    mode: "onChange",
    resolver: zodResolver(
      new ZodValidator().generateSchema(config)
    ) as Resolver<TFieldValues>,
  });

  const registry = useRef<FormRegistryContextType<TFieldValues>["registry"]>(
    {}
  );

  const onChangeRecord = useRef<
    FormRegistryContextType<TFieldValues>["onChangeRecord"]
  >({});

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

  const registerOnChangeRecord = useCallback(
    (fieldConfig: FormFieldConfig) => {
      const { name, onConditionMatch } = fieldConfig;
      if (!onConditionMatch?.length) return;

      // ✅ Avoid re-registering the same field's conditions
      if (registry.current?.[name]) return;

      onConditionMatch.forEach((rule) => {
        // Example rule: { if: { properties: { country: { const: "India" } } }, then: { ... }, else: { ... } }

        const conditionFields = Object.keys(rule.if?.properties || {});
        conditionFields.forEach((depField) => {
          if (!onChangeRecord.current![depField]) {
            onChangeRecord.current![depField] = [];
          }

          onChangeRecord.current![depField].push({
            // store the AJV compiled validator for performance
            if: rule.if || {},
            then: rule.then || {},
            else: rule.else || {},
            target: name as Path<TFieldValues>,
          });
        });
      });
    },
    [onChangeRecord]
  );

  const register = useCallback(
    (
      name: string,
      config: Omit<FormFieldConfig, "name"> & { name: string },
      setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
    ) => {
      if (registry.current) {
        registerOnChangeRecord(config);
        registry.current[name as string] = {
          config: config as Omit<FormFieldConfig, "name"> & {
            name: FieldPath<TFieldValues>;
          },
          setState: setStateCall,
          initialConfig: config as Omit<FormFieldConfig, "name"> & {
            name: FieldPath<TFieldValues>;
          },
        } as TFieldValues[keyof TFieldValues];
      }
    },
    [registerOnChangeRecord]
  );

  const handleGlobalChange = useCallback(
    (fieldName: string, value: unknown) => {
      console.log(onChangeRecord.current);
      const allValues = form.getValues();
      if (onChange) {
        onChange(fieldName, value, allValues);
      }

      const validator = new AjvValidator();
      if (onChangeRecord.current && onChangeRecord.current[fieldName]) {
        const collectedChange: Record<string, Partial<FormFieldConfig>> = {};
        onChangeRecord.current[fieldName].forEach(
          (rule: ChangeRule<TFieldValues>) => {
            const { isValid } = validator.validate(rule.if, allValues);
            if (isValid) {
              Object.keys(rule.then).forEach((key) => {
                //Merge rule.then[key] with collectedChange[key]
                collectedChange[key] = mergeDeep(
                  collectedChange[key] as Record<string, unknown>,
                  rule.then[key] as Record<string, unknown>
                );
              });
            } else {
              if (Object.keys(rule.else || {}).length > 0) {
                // If else condition has keys, apply those changes
                Object.keys(rule.else).forEach((key) => {
                  collectedChange[key] = mergeDeep(
                    collectedChange[key] as Record<string, unknown>,
                    rule.else[key] as Record<string, unknown>
                  );
                });
              } else {
                // If no else condition, reset the fields from 'then' to initial values
                Object.keys(rule.then).forEach((key) => {
                  const target = registry.current?.[key];
                  if (target?.initialConfig) {
                    collectedChange[key] = target.initialConfig;
                  }
                });
              }
            }
          }
        );

        // Merge collected changes into existing registered field configs
        Object.keys(collectedChange).forEach((targetFieldName) => {
          const target = registry.current?.[targetFieldName];
          if (!target) return;
          const currentConfig =
            target.config ?? ({} as Partial<FormFieldConfig>);
          const mergedConfig = mergeDeep(
            {} as Partial<FormFieldConfig>,
            currentConfig as Record<string, unknown>,
            collectedChange[targetFieldName] as Record<string, unknown>
          );
          target.setState(mergedConfig);
        });
      }
    },
    [onChange, form]
  );

  return (
    <Form {...form}>
      <FormRegistryContext.Provider
        value={{
          registry: registry.current as unknown as Record<
            string,
            RegistryEntry<FieldValues>
          >,
          register: register as unknown as (
            name: Path<FieldValues>,
            config: Omit<FormFieldConfig, "name"> & {
              name: FieldPath<FieldValues>;
            },

            setStateCall: (state: FieldValues[keyof FieldValues]) => void
          ) => void,
          adapter: {
            ...adapter,
          },
          updateState: updateState as unknown as (
            newConfig: Omit<FormFieldConfig, "name"> & { name: string }
          ) => void,
          onChange: handleGlobalChange as unknown as (
            fieldName: string,
            value: unknown,
            allValues: FieldValues
          ) => void,
          registerOnChangeRecord: registerOnChangeRecord as unknown as (
            fieldConfig: FormFieldConfig
          ) => void,
          onChangeRecord: onChangeRecord.current as unknown as Record<
            string,
            ChangeRule<FieldValues>[]
          >,
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
