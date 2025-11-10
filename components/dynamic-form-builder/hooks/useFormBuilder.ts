"use client";

import { mergeDeep } from "@/lib/utils";
import { Parser, Value } from "expr-eval";
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
  FormRegistryContext,
  GraphNode,
} from "../types";
import {
  buildAjvSchemaFromPath,
  getFullFieldNameWithPath,
  validateAjv,
} from "../utils";
import { AjvValidator } from "../validator/AjvValidator";

const parser = new Parser();
const Validator = new AjvValidator();

import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
} from "date-fns";

// Helper functions for date operations
const getToday = () => format(new Date(), "yyyy-MM-dd");

const getDateDiff = (
  date1: string,
  date2: string,
  unit: "days" | "months" | "years" = "days"
) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  switch (unit) {
    case "days":
      return differenceInDays(d1, d2);
    case "months":
      return differenceInMonths(d1, d2);
    case "years":
      return differenceInYears(d1, d2);
    default:
      return differenceInDays(d1, d2);
  }
};

parser.functions.today = getToday;
parser.functions.dateDiff = getDateDiff;

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
    resolver: Validator.customAjvResolver(
      Validator.generateSchema(fields || [])
    ) as Resolver<T>,
  });

  const registry = useRef<FormRegistryContext<T>["registry"]>({});
  const formulaRegistry = useRef<FormRegistryContext<T>["formulaRegistry"]>({});
  const onChangeRegistry = useRef<FormRegistryContext<T>["onChangeRegistry"]>(
    {}
  );
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

      const parentPath = fullFieldNameWithPath
        .split(".")
        .slice(0, -1)
        .join(".");
      onConditionMatch.forEach((rule) => {
        const conditionFields = Object.keys(rule.if?.properties || {});
        conditionFields.forEach((depField) => {
          const depFieldNameWithPath = getFullFieldNameWithPath(
            depField,
            parentPath
          );
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

  const debounceRegisterFormula = useCallback(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const adjList: Record<string, GraphNode<T>> = {};
    return (fullFieldNameWithPath: string, fieldConfig: FormFieldConfig) => {
      const { formula } = fieldConfig;
      if (!formula) return;
      const expr = parser.parse(formula);
      const parentVariables = expr.variables();
      const currentNode = {
        key: fullFieldNameWithPath,
        value: formula,
        parents: {},
        children: {},
      };

      if (!adjList[fullFieldNameWithPath]) {
        adjList[fullFieldNameWithPath] = currentNode;
      }
      parentVariables.forEach((parent) => {
        if (!adjList[parent]) {
          adjList[parent] = {
            key: parent,
            value: null,
            parents: {},
            children: {},
          };
        }
        // adjList[parent].children[fullFieldNameWithPath] = childNode;
        adjList[fullFieldNameWithPath].parents[parent] = adjList[parent];
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        // Perform topological sort to create formula registry
        const visited = new Set<string>();
        const sorted: string[] = [];

        function visit(node: string, childNode: GraphNode<T> | null) {
          if (visited.has(node)) return;
          visited.add(node);

          const currentNode = adjList[node];
          if (childNode) {
            currentNode.children[childNode.key] = childNode;
          }
          Object.keys(currentNode.parents).forEach((parent) => {
            visit(parent, currentNode);
          });

          sorted.push(node);
        }

        Object.keys(adjList).forEach((node) => {
          if (!visited.has(node)) {
            visit(node, null);
          }
        });

        // Create formula registry with sorted nodes
        formulaRegistry.current = sorted.reduce((acc, key) => {
          acc[key] = adjList[key];
          return acc;
        }, {} as Record<string, GraphNode<T>>);

        timeoutId = null;
      }, 100);
    };
  }, [formulaRegistry]);

  const registerFormula = useMemo(
    () => debounceRegisterFormula(),
    [debounceRegisterFormula]
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
              const targetField = getFullFieldNameWithPath(
                key,
                rule.parentPath
              );
              dependentFields.add(targetField);
            });
          }
        });
        return dependentFields;
      }

      function applyFieldChanges(
        accumlatedChanges: Record<string, Partial<FormFieldConfig>>
      ) {
        Object.keys(accumlatedChanges).forEach((targetFieldName) => {
          const target = registry.current?.[targetFieldName];
          if (!target) return;
          const initialState =
            target.initialState ?? ({} as Partial<FormFieldConfig>);
          const mergedConfig = mergeDeep(
            {} as Partial<FormFieldConfig>,
            initialState as Record<string, unknown>,
            accumlatedChanges[targetFieldName] as Record<string, unknown>
          );
          registry.current![targetFieldName].currentState =
            mergedConfig as FormFieldConfig & { name: FieldPath<T> };
          target.setState(mergedConfig);
        });
      }

      function resetFieldsToInitialState(fieldsToReset: Set<string>) {
        fieldsToReset.forEach((field) => {
          const target = registry.current?.[field];
          if (!target) return;
          const initialState =
            target.initialState ?? ({} as Partial<FormFieldConfig>);
          const mergedConfig = mergeDeep(
            {} as Partial<FormFieldConfig>,
            initialState as Record<string, unknown>
          );
          registry.current![field].currentState =
            mergedConfig as FormFieldConfig & { name: FieldPath<T> };
          target.setState(mergedConfig);
        });
      }

      allValues = replaceUndefined(allValues);

      const DFS = (node: GraphNode<T>) => {
        if (node.value) {
          const key = node.key;
          const expr = parser.parse(node.value);
          const res = expr.evaluate(allValues as Value);
          form.setValue(key as Path<T>, res, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          let curr = allValues;
          const paths = key.split(".") as Path<T>[];
          paths.forEach((path, index) => {
            curr = (curr as never)[path];
            if (index === paths.length - 1) {
              curr = res;
            }
          });
        }

        if (node.children) {
          Object.values(node.children).forEach((child) => {
            DFS(child);
          });
        }
      };

      DFS(formulaRegistry.current![fieldName]);

      if (!onChangeRegistry.current || !onChangeRegistry.current[fieldName])
        return;

      const rules = onChangeRegistry.current[fieldName];
      const accumlatedChanges: Record<string, Partial<FormFieldConfig>> = {};
      const allDependentFields = collectDependentFields(rules);
      const updatedFields = new Set<string>();

      rules.forEach((rule: ChangeRule<T>) => {
        const { isValid } = validateAjv(rule.if, allValues);
        if (isValid) {
          Object.keys(rule.then).forEach((key) => {
            updatedFields.add(key);
            const targetFieldNameWithPath = getFullFieldNameWithPath(
              key,
              rule.parentPath
            );
            accumlatedChanges[targetFieldNameWithPath] = mergeDeep(
              accumlatedChanges[targetFieldNameWithPath] as Record<
                string,
                unknown
              >,
              rule.then[key] as Record<string, unknown>
            );
          });
        } else {
          if (Object.keys(rule.else || {}).length > 0) {
            Object.keys(rule.else).forEach((key) => {
              updatedFields.add(key);
              const targetFieldNameWithPath = getFullFieldNameWithPath(
                key,
                rule.parentPath
              );
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
      registerFormula(fullFieldNameWithPath, fieldConfig);
      registry.current[fullFieldNameWithPath as string] = {
        config: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
        setState: setStateCall,
        initialState: fieldConfig as FormFieldConfig & { name: FieldPath<T> },
      } as T[keyof T];

      scheduleEvaluationAfterRegistration();
    },
    [
      registerOnChangeUpdates,
      form,
      evaluateConditionsAndUpdate,
      registerFormula,
    ]
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
      if (
        fields &&
        fields.length > 0 &&
        registry.current &&
        Object.keys(registry.current).length > 0
      ) {
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
