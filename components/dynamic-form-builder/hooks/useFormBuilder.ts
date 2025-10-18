"use client";

import { mergeDeep } from "@/lib/utils";
import { debounce } from "lodash";
import { useCallback, useMemo, useRef } from "react";
import {
  FieldPath,
  FieldValues,
  Path,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import {
  ChangeRule,
  FormFieldConfig,
  FormProps,
  FormRegistryContext
} from "../types";
import { buildAjvSchemaFromPath, getFullFieldNameWithPath, validateAjv } from "../utils";
import { AjvValidator } from "../validator/AjvValidator";
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
    resolver: Validator.customAjvResolver(Validator.generateSchema(fields || [])) as Resolver<T>,
  });

  const registry = useRef<FormRegistryContext<T>["registry"]>({}); // Store registered field components
  const onChangeRegistry = useRef<FormRegistryContext<T>["onChangeRecord"]>({}); // Track conditional field dependencies

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
  const registerOnChangeUpdates = useCallback(
    (fullFieldNameWithPath: string, fieldConfig: FormFieldConfig) => {
      const { onConditionMatch } = fieldConfig;
      if (!onConditionMatch?.length) return;
      if (registry.current?.[fullFieldNameWithPath]) return;

      const parentPath = fullFieldNameWithPath.split('.').slice(0, -1).join('.');
      onConditionMatch.forEach((rule) => {
        const conditionFields = Object.keys(rule.if?.properties || {}); // Get fields that trigger conditions
        conditionFields.forEach((depField) => {
          const depFieldNameWithPath = getFullFieldNameWithPath(depField, parentPath);
          if (!onChangeRegistry.current![depFieldNameWithPath]) {
            onChangeRegistry.current![depFieldNameWithPath] = [];
          }
          const ifCondition = buildAjvSchemaFromPath(parentPath, rule.if);
          
          onChangeRegistry.current![depFieldNameWithPath].push({
            if: ifCondition,
            then: rule.then || {},
            else: rule.else || {},
            parentPath: parentPath as Path<T>,
          });
        });
      });
    },
    [onChangeRegistry]
  );

  // Unregister field from registry when the field is unmounted
  const unregister = useCallback(
    (name: Path<T>) => {
      if (registry.current?.[name]) delete registry.current[name as string];
      if (onChangeRegistry.current?.[name])
        delete onChangeRegistry.current[name as string];
    },
    [registry, onChangeRegistry]
  );

  // Register field in registry and change tracking
  const register = useCallback(
    (
      fullFieldNameWithPath: string,
      fieldConfig: FormFieldConfig,
      setStateCall: (state: T[keyof T]) => void
    ) => {
      if (!registry.current) return;
      registerOnChangeUpdates(fullFieldNameWithPath, fieldConfig);
      registry.current[fullFieldNameWithPath as string] = {
        config: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
        setState: setStateCall,
        initialState: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
      } as T[keyof T];
    },
    [registerOnChangeUpdates]
  );

  // Run conditional field dependencies by validating the conditions in the onChangeRecord
  // and applying the changes to the target fields.
  const evaluateConditionsAndUpdate = useCallback(
    (fieldName: string, allValues: unknown) => {
      if (!onChangeRegistry.current || !onChangeRegistry.current[fieldName]) return;

      // Accumulates field changes for each rule
      const collectedChange: Record<string, Partial<FormFieldConfig>> = {}; 

      const dependentFields = new Set<string>();
      onChangeRegistry.current[fieldName].forEach((rule: ChangeRule<T>) => {
        Object.keys(rule.then).forEach((key) => {
          const targetField = getFullFieldNameWithPath(key, rule.parentPath);
          dependentFields.add(targetField);
        });
        
        if (rule.else) {
          Object.keys(rule.else).forEach((key) => {
            const targetField = getFullFieldNameWithPath(key, rule.parentPath);
            dependentFields.add(targetField);
          });
        }
      });

      const fieldsWhichWereUpdated = new Set<string>();
      onChangeRegistry.current[fieldName].forEach((rule: ChangeRule<T>) => {
        const { isValid } = validateAjv(rule.if, allValues);
        if (isValid) {
          Object.keys(rule.then).forEach((key) => {
            fieldsWhichWereUpdated.add(key);
            const targetFieldNameWithPath = getFullFieldNameWithPath(key, rule.parentPath);
            collectedChange[targetFieldNameWithPath] = mergeDeep(
              collectedChange[targetFieldNameWithPath] as Record<string, unknown>,
              rule.then[key] as Record<string, unknown>
            );
          });
        } 
        else {
          if (Object.keys(rule.else || {}).length > 0) {
            Object.keys(rule.else).forEach((key) => {
              fieldsWhichWereUpdated.add(key);
              const targetFieldNameWithPath = getFullFieldNameWithPath(key, rule.parentPath);
              collectedChange[targetFieldNameWithPath] = mergeDeep(
                collectedChange[key] as Record<string, unknown>,
                rule.else[key] as Record<string, unknown>
              );
            });
          } 
        }
      });

      const fieldsToReset = new Set<string>();
      dependentFields.forEach((field) => {
        if (!fieldsWhichWereUpdated.has(field)) {
          fieldsToReset.add(field);
        }
      });

      fieldsToReset.forEach((field) => {
        const target = registry.current?.[field];
        if (!target) return;
        const initialState = target.initialState ?? ({} as Partial<FormFieldConfig>);
        const mergedConfig = mergeDeep(
          {} as Partial<FormFieldConfig>,
          initialState as Record<string, unknown>
        );
        registry.current![field].currentState = mergedConfig as FormFieldConfig & { name: FieldPath<T> };
        target.setState(mergedConfig); // Apply merged configuration to target field
      });

      Object.keys(collectedChange).forEach((targetFieldName) => {
        const target = registry.current?.[targetFieldName];
        if (!target) return;
        const initialState = target.initialState ?? ({} as Partial<FormFieldConfig>);
        const mergedConfig = mergeDeep(
          {} as Partial<FormFieldConfig>,
          initialState as Record<string, unknown>,
          collectedChange[targetFieldName] as Record<string, unknown>
        );
        registry.current![targetFieldName].currentState = mergedConfig as FormFieldConfig & { name: FieldPath<T> };
        target.setState(mergedConfig); // Apply merged configuration to target field
      });
    },
    [registry]
  );

  
  const debouncedEvaluateConditionsAndUpdate = useMemo(() => {
    return debounce(evaluateConditionsAndUpdate, 300); // Debounce condition evaluation to prevent excessive updates
  }, [evaluateConditionsAndUpdate]);

  const handleGlobalChange = useCallback(
    (fieldName: string, value: unknown) => {
      const allValues = form.getValues();
      if (onChange) onChange(fieldName, value, allValues);
      debouncedEvaluateConditionsAndUpdate(fieldName, allValues);
    },
    [onChange, form, debouncedEvaluateConditionsAndUpdate]
  );

  return {
    form,
    handleSubmit,
    contextValue: {
      registry: registry.current,
      register,
      adapter: { ...(adapter || {}) },
      unregister,
      updateState,
      onChange: handleGlobalChange,
      registerOnChangeRecord: registerOnChangeUpdates,
      onChangeRecord: onChangeRegistry.current,
    },
  } as const;
}
