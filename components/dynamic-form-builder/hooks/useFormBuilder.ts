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
  FormGenratorProps,
  FormRegistryContextType,
  RegistryEntry,
} from "../types";
import { debounce } from "lodash";

const FormResolver = ajvResolver;
const Validator = new AjvValidator();

export function useFormBuilder<TFieldValues extends FieldValues>({
  config,
  onSubmit,
  adapter,
  initialValues,
  onChange,
}: FormGenratorProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    defaultValues: initialValues,
    mode: "onChange",
    resolver: FormResolver(
      Validator.generateSchema(config) as JSONSchemaType<unknown>
    ) as Resolver<TFieldValues>,
  });

  const registry = useRef<FormRegistryContextType<TFieldValues>["registry"]>(
    {}
  );
  const onChangeRecord = useRef<
    FormRegistryContextType<TFieldValues>["onChangeRecord"]
  >({});

  const handleSubmit: SubmitHandler<TFieldValues> = (values) => {
    if (onSubmit) onSubmit(values);
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
      if (registry.current?.[name]) return;

      onConditionMatch.forEach((rule) => {
        const conditionFields = Object.keys(rule.if?.properties || {});
        conditionFields.forEach((depField) => {
          if (!onChangeRecord.current![depField]) {
            onChangeRecord.current![depField] = [];
          }
          onChangeRecord.current![depField].push({
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

  const unregister = useCallback(
    (name: Path<TFieldValues>) => {
      if (registry.current?.[name]) delete registry.current[name as string];
      if (onChangeRecord.current?.[name])
        delete onChangeRecord.current[name as string];
    },
    [registry, onChangeRecord]
  );

  const register = useCallback(
    (
      name: string,
      fieldConfig: Omit<FormFieldConfig, "name"> & { name: string },
      setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
    ) => {
      if (!registry.current) return;
      registerOnChangeRecord(fieldConfig);
      registry.current[name as string] = {
        config: fieldConfig as Omit<FormFieldConfig, "name"> & {
          name: FieldPath<TFieldValues>;
        },
        setState: setStateCall,
        initialConfig: fieldConfig as Omit<FormFieldConfig, "name"> & {
          name: FieldPath<TFieldValues>;
        },
      } as TFieldValues[keyof TFieldValues];
    },
    [registerOnChangeRecord]
  );

  const runOnChangeConditions = useCallback(
    (fieldName: string, allValues: unknown) => {
      if (!onChangeRecord.current || !onChangeRecord.current[fieldName]) return;

      const validator = Validator;
      const collectedChange: Record<string, Partial<FormFieldConfig>> = {};

      onChangeRecord.current[fieldName].forEach(
        (rule: ChangeRule<TFieldValues>) => {
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
                  collectedChange[key] = target.initialConfig;
                }
              });
            }
          }
        }
      );

      Object.keys(collectedChange).forEach((targetFieldName) => {
        const target = registry.current?.[targetFieldName];
        if (!target) return;
        const currentConfig = target.config ?? ({} as Partial<FormFieldConfig>);
        const mergedConfig = mergeDeep(
          {} as Partial<FormFieldConfig>,
          currentConfig as Record<string, unknown>,
          collectedChange[targetFieldName] as Record<string, unknown>
        );
        target.setState(mergedConfig);
      });
    },
    [registry]
  );

  const debouncedRunOnChangeConditions = useMemo(() => {
    return debounce(runOnChangeConditions, 800);
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
      registry: registry.current as Record<string, RegistryEntry<FieldValues>>,
      register: register as unknown as (
        name: Path<FieldValues>,
        config: Omit<FormFieldConfig, "name"> & {
          name: FieldPath<FieldValues>;
        },
        setStateCall: (state: FieldValues[keyof FieldValues]) => void
      ) => void,
      adapter: { ...(adapter || {}) },
      unregister: unregister as unknown as (name: Path<FieldValues>) => void,
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
    },
  } as const;
}
