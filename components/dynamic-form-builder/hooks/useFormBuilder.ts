"use client";

import { mergeDeep } from "@/lib/utils";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DefaultValues,
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
  onChange,
}: FormProps<T>) {
  const fields = formConfig.fields;
  const form = useForm<T>({
    defaultValues: formConfig.initialValues as DefaultValues<T>,
    mode: "onChange",
    resolver: Validator.customAjvResolver(Validator.generateSchema(fields || [])) as Resolver<T>,
  });

  const registry = useRef<FormRegistryContext<T>["registry"]>({});
  const onChangeRegistry = useRef<FormRegistryContext<T>["onChangeRegistry"]>({});
  const registrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit: SubmitHandler<T> = (values) => {
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

  const registerOnChangeUpdates = useCallback(
    (fullFieldNameWithPath: string, fieldConfig: FormFieldConfig) => {
      const { onConditionMatch } = fieldConfig;
      if (!onConditionMatch?.length) return;
      if (registry.current?.[fullFieldNameWithPath]) return;

      const parentPath = fullFieldNameWithPath.split('.').slice(0, -1).join('.');
      onConditionMatch.forEach((rule) => {
        const conditionFields = Object.keys(rule.if?.properties || {});
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

  const evaluateConditionsAndUpdate = useCallback(
    (fieldName: string, allValues: unknown) => {
      function replaceUndefined(obj: unknown) {
        return JSON.parse(
          JSON.stringify(obj, (_, v) => (v === undefined ? null : v))
        );
      }
      
      function collectDependentFields(rules: ChangeRule<T>[]) {
        const dependentFields = new Set<string>();
        rules.forEach((rule) => {
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
        return dependentFields;
      }

      function applyFieldChanges(accumlatedChanges: Record<string, Partial<FormFieldConfig>>) {
        Object.keys(accumlatedChanges).forEach((targetFieldName) => {
          const target = registry.current?.[targetFieldName];
          if (!target) return;
          const initialState = target.initialState ?? ({} as Partial<FormFieldConfig>);
          const mergedConfig = mergeDeep(
            {} as Partial<FormFieldConfig>,
            initialState as Record<string, unknown>,
            accumlatedChanges[targetFieldName] as Record<string, unknown>
          );
          registry.current![targetFieldName].currentState = mergedConfig as FormFieldConfig & { name: FieldPath<T> };
          target.setState(mergedConfig);
        });
      }

      function resetFieldsToInitialState(fieldsToReset: Set<string>) {
        fieldsToReset.forEach((field) => {
          const target = registry.current?.[field];
          if (!target) return;
          const initialState = target.initialState ?? ({} as Partial<FormFieldConfig>);
          const mergedConfig = mergeDeep(
            {} as Partial<FormFieldConfig>,
            initialState as Record<string, unknown>
          );
          registry.current![field].currentState = mergedConfig as FormFieldConfig & { name: FieldPath<T> };
          target.setState(mergedConfig);
        });
      }
      
      allValues = replaceUndefined(allValues);
      if (!onChangeRegistry.current || !onChangeRegistry.current[fieldName]) return;

      const rules = onChangeRegistry.current[fieldName];
      const accumlatedChanges: Record<string, Partial<FormFieldConfig>> = {};
      const allDependentFields = collectDependentFields(rules);
      const updatedFields = new Set<string>();

      rules.forEach((rule: ChangeRule<T>) => {
        const { isValid } = validateAjv(rule.if, allValues);
        if (isValid) {
          Object.keys(rule.then).forEach((key) => {
            updatedFields.add(key);
            const targetFieldNameWithPath = getFullFieldNameWithPath(key, rule.parentPath);
            accumlatedChanges[targetFieldNameWithPath] = mergeDeep(
              accumlatedChanges[targetFieldNameWithPath] as Record<string, unknown>,
              rule.then[key] as Record<string, unknown>
            );
          });
        } else {
          if (Object.keys(rule.else || {}).length > 0) {
            Object.keys(rule.else).forEach((key) => {
              updatedFields.add(key);
              const targetFieldNameWithPath = getFullFieldNameWithPath(key, rule.parentPath);
              accumlatedChanges[targetFieldNameWithPath] = mergeDeep(
                accumlatedChanges[key] as Record<string, unknown>,
                rule.else[key] as Record<string, unknown>
              );
            });
          }
        }
      });

      const fieldsToReset = new Set<string>();
      allDependentFields.forEach((field) => {
        if (!updatedFields.has(field)) {
          fieldsToReset.add(field);
        }
      });

      resetFieldsToInitialState(fieldsToReset);
      applyFieldChanges(accumlatedChanges);
    },
    []
  );

  const unregister = useCallback(
    (name: Path<T>) => {
      if (registry.current?.[name]) delete registry.current[name as string];
      if (onChangeRegistry.current?.[name])
        delete onChangeRegistry.current[name as string];
    },
    [registry, onChangeRegistry]
  );

  const register = useCallback(
    (
      fullFieldNameWithPath: string,
      fieldConfig: FormFieldConfig,
      setStateCall: (state: T[keyof T]) => void
    ) => {
      function scheduleEvaluationAfterRegistration() {
        if (registrationTimeoutRef.current) {
          clearTimeout(registrationTimeoutRef.current);
        }
        registrationTimeoutRef.current = setTimeout(() => {
          const allValues = form.getValues();
          Object.keys(onChangeRegistry.current || {}).forEach((fieldName) => {
            evaluateConditionsAndUpdate(fieldName, allValues);
          });
        }, 50);
      }

      if (!registry.current) return;
      registerOnChangeUpdates(fullFieldNameWithPath, fieldConfig);
      registry.current[fullFieldNameWithPath as string] = {
        config: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
        setState: setStateCall,
        initialState: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
      } as T[keyof T];

      scheduleEvaluationAfterRegistration();
    },
    [registerOnChangeUpdates, form, evaluateConditionsAndUpdate]
  );

  const debouncedEvaluateConditionsAndUpdate = useMemo(() => {
    return debounce(evaluateConditionsAndUpdate, 300);
  }, [evaluateConditionsAndUpdate]);

  const handleGlobalChange = useCallback(
    (fieldName: string, value: unknown) => {
      const allValues = form.getValues();
      if (onChange) onChange(fieldName, value, allValues);
      debouncedEvaluateConditionsAndUpdate(fieldName, allValues);
    },
    [onChange, form, debouncedEvaluateConditionsAndUpdate]
  );

  useEffect(() => {
    function evaluateAllFields() {
      const allValues = form.getValues();
      Object.keys(onChangeRegistry.current || {}).forEach((fieldName) => {
        evaluateConditionsAndUpdate(fieldName, allValues);
      });
    }

    const timeoutId = setTimeout(() => {
      if (fields && fields.length > 0 && registry.current && Object.keys(registry.current).length > 0) {
        evaluateAllFields();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [fields, form, evaluateConditionsAndUpdate]);

  useEffect(() => {
    return () => {
      if (registrationTimeoutRef.current) {
        clearTimeout(registrationTimeoutRef.current);
      }
    };
  }, []);

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
      onChangeRegistry: onChangeRegistry.current,
    },
  } as const;
}
