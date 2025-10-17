"use client";

import { mergeDeep } from "@/lib/utils";
import { ajvResolver } from "@hookform/resolvers/ajv";
import { JSONSchemaType } from "ajv";
import { useCallback, useMemo, useRef } from "react";
import {
  FieldPath,
  FieldValues,
  Path,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { AjvValidator } from "../validator/AjvValidator";
import {
  ChangeRule,
  FormFieldConfig,
  FormProps,
  FormRegistryContext,
  RegistryEntry,
} from "../types";
import { debounce } from "lodash";

const FormResolver = ajvResolver;
const Validator = new AjvValidator();

export function useFormBuilder<T extends FieldValues>({
  formConfig,
  onSubmit,
  adapter,
  initialValues,
  onChange,
}: FormProps<T>) {
  const fields = formConfig.fields;
  const form = useForm<T>({
    defaultValues: initialValues,
    mode: "onChange",
    resolver: FormResolver(
      Validator.generateSchema(fields || []) as JSONSchemaType<T>
    ) as Resolver<T>,
  });

  const registry = useRef<FormRegistryContext<T>["registry"]>({}); // Store registered field components
  const onChangeRecord = useRef<FormRegistryContext<T>["onChangeRecord"]>({}); // Track conditional field dependencies

  const handleSubmit: SubmitHandler<T> = (values) => {
    if (onSubmit) onSubmit(values);
  };

  const updateState = useCallback(
    (newConfig: Omit<FormFieldConfig, "name"> & { name: string }) => {
      if (registry.current) {
        const { name, ...rest } = newConfig;
        registry.current[name]?.setState(rest); // Update field state in registry
      }
    },
    []
  );

  // Register conditional field dependencies when the field is mounted
  const registerOnChangeRecord = useCallback(
    (fieldConfig: FormFieldConfig) => {
      const { name, onConditionMatch } = fieldConfig;
      if (!onConditionMatch?.length) return;
      if (registry.current?.[name]) return;

      onConditionMatch.forEach((rule) => {
        const conditionFields = Object.keys(rule.if?.properties || {}); // Get fields that trigger conditions
        conditionFields.forEach((depField) => {
          if (!onChangeRecord.current![depField]) {
            onChangeRecord.current![depField] = [];
          }
          onChangeRecord.current![depField].push({
            if: rule.if || {},
            then: rule.then || {},
            else: rule.else || {},
            target: name as Path<T>,
          });
        });
      });
    },
    [onChangeRecord]
  );

  // Unregister field from registry when the field is unmounted
  const unregister = useCallback(
    (name: Path<T>) => {
      if (registry.current?.[name]) delete registry.current[name as string];
      if (onChangeRecord.current?.[name])
        delete onChangeRecord.current[name as string];
    },
    [registry, onChangeRecord]
  );

  // Register field in registry and change tracking
  const register = useCallback(
    (
      name: string,
      fieldConfig: Omit<FormFieldConfig, "name"> & { name: string },
      setStateCall: (state: T[keyof T]) => void
    ) => {
      if (!registry.current) return;
      registerOnChangeRecord(fieldConfig);
      registry.current[name as string] = {
        config: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
        setState: setStateCall,
        initialConfig: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
      } as T[keyof T];
    },
    [registerOnChangeRecord]
  );

  // Run conditional field dependencies by validating the conditions in the onChangeRecord
  // and applying the changes to the target fields.
  const runOnChangeConditions = useCallback(
    (fieldName: string, allValues: unknown) => {
      if (!onChangeRecord.current || !onChangeRecord.current[fieldName]) return;

      const validator = Validator;
      const collectedChange: Record<string, Partial<FormFieldConfig>> = {}; // Accumulate field changes

      onChangeRecord.current[fieldName].forEach((rule: ChangeRule<T>) => {
        const { isValid } = validator.validate(rule.if, allValues);
        if (isValid) {
          Object.keys(rule.then).forEach((key) => {
            collectedChange[key] = mergeDeep(
              collectedChange[key] as Record<string, unknown>,
              rule.then[key] as Record<string, unknown>
            );
          });
        } else {
          if (Object.keys(rule.else || {}).length > 0) {
            Object.keys(rule.else).forEach((key) => {
              collectedChange[key] = mergeDeep(
                collectedChange[key] as Record<string, unknown>,
                rule.else[key] as Record<string, unknown>
              );
            });
          } else {
            Object.keys(rule.then).forEach((key) => {
              const target = registry.current?.[key];
              if (target?.initialConfig) {
                collectedChange[key] = target.initialConfig; // Reset to initial config if no else condition
              }
            });
          }
        }
      });

      Object.keys(collectedChange).forEach((targetFieldName) => {
        const target = registry.current?.[targetFieldName];
        if (!target) return;
        const currentConfig = target.config ?? ({} as Partial<FormFieldConfig>);
        const mergedConfig = mergeDeep(
          {} as Partial<FormFieldConfig>,
          currentConfig as Record<string, unknown>,
          collectedChange[targetFieldName] as Record<string, unknown>
        );
        target.setState(mergedConfig); // Apply merged configuration to target field
      });
    },
    [registry]
  );

  const debouncedRunOnChangeConditions = useMemo(() => {
    return debounce(runOnChangeConditions, 800); // Debounce condition evaluation to prevent excessive updates
  }, [runOnChangeConditions]);

  const handleGlobalChange = useCallback(
    (fieldName: string, value: unknown) => {
      const allValues = form.getValues();
      if (onChange) onChange(fieldName, value, allValues);
      debouncedRunOnChangeConditions(fieldName, allValues);
    },
    [onChange, form, debouncedRunOnChangeConditions]
  );

  return {
    form,
    handleSubmit,
    contextValue: {
      registry: registry.current as Record<string, RegistryEntry<T>>,
      register: register as unknown as (
        name: string,
        config: FormFieldConfig & { name: string },
        setStateCall: (state: unknown) => void
      ) => void,
      adapter: { ...(adapter || {}) },
      unregister: unregister as unknown as (name: string) => void,
      updateState: updateState as unknown as (
        newConfig: FormFieldConfig & { name: string }
      ) => void,
      onChange: handleGlobalChange as unknown as (
        fieldName: string,
        value: unknown,
        allValues: T
      ) => void,
      registerOnChangeRecord: registerOnChangeRecord as unknown as (
        fieldConfig: FormFieldConfig
      ) => void,
      onChangeRecord: onChangeRecord.current as unknown as Record<
        string,
        ChangeRule<FieldValues>[]
      >,
    } as FormRegistryContext<T>,
  } as const;
}
