"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as RHFFormField,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { useFormRegistryContext } from "./hooks/useFormRegistryContext";
import {
  FormFieldConfig,
  FormItemType,
  FormOption,
  FormSettings,
} from "./types";
import { getFullFieldNameWithPath } from "./utils";
const ArrayFormField = dynamic(
  () => import("./fields/ArrayFormField").then((m) => m.ArrayFormField),
  { ssr: false }
);
const CheckboxFormField = dynamic(
  () => import("./fields/CheckboxFormField").then((m) => m.CheckboxFormField),
  { ssr: false }
);
const CheckboxGroupFormField = dynamic(
  () =>
    import("./fields/CheckboxGroupFormField").then(
      (m) => m.CheckboxGroupFormField
    ),
  { ssr: false }
);
const RadioGroupFormField = dynamic(
  () =>
    import("./fields/RadioGroupFormField").then((m) => m.RadioGroupFormField),
  { ssr: false }
);
const SelectFormField = dynamic(
  () => import("./fields/SelectFormField").then((m) => m.SelectFormField),
  { ssr: false }
);
const TextFormField = dynamic(
  () => import("./fields/TextFormField").then((m) => m.TextFormField),
  { ssr: false }
);
const TextAreaFormField = dynamic(
  () => import("./fields/TextAreaFormField").then((m) => m.TextAreaFormField),
  { ssr: false }
);
const DateFormField = dynamic(
  () => import("./fields/DateFormField").then((m) => m.DateFormField),
  { ssr: false }
);
const NumberFormField = dynamic(
  () => import("./fields/NumberFormField").then((m) => m.NumberFormField),
  { ssr: false }
);

type Props<T extends FieldValues> = {
  settings: FormSettings;
  control: Control<T>;
  field: FormFieldConfig & { name: FieldPath<T> };
};

export function FormField<T extends FieldValues>({
  settings,
  control,
  field,
  path,
}: Props<T> & { path?: string }) {
  const [state, setState] = useState<FieldValues[keyof FieldValues]>(field);
  const fieldName = field.name;
  const fullFieldNameWithPath = getFullFieldNameWithPath(fieldName, path);
  const label = state.label;
  const layout = settings?.layout || "vertical";

  // Merge default classNames with field-specific classNames (field-specific takes priority)
  const mergedClassNames = {
    body: cn(settings?.defaultClassNames?.body, state.classNames?.body),
    label: cn(settings?.defaultClassNames?.label, state.classNames?.label),
    field: cn(settings?.defaultClassNames?.field, state.classNames?.field),
  };

  useEffect(() => {
    setState(field);
  }, [field]);

  const { register, adapter, onChange, unregister } =
    useFormRegistryContext<FieldValues>();
  const form = useFormContext();

  useEffect(() => {
    register?.(fullFieldNameWithPath, field, setState);
    return () => {
      unregister?.(fullFieldNameWithPath);
    };
  }, [fieldName, field, register, setState, unregister, fullFieldNameWithPath]);

  const Component = useCallback(
    (field: { value: unknown; onChange: (value: unknown) => void }) => {
      const handleChange = (value: unknown) => {
        field.onChange(value);
        if (onChange) {
          const allValues = form.getValues();
          onChange(fullFieldNameWithPath, value, allValues);
        }
      };
      const placeholder =
        typeof label === "string"
          ? `Enter ${label}`
          : typeof state.alternateLabel === "string"
          ? `Enter ${state.alternateLabel}`
          : undefined;
      if (adapter?.[state.renderComponent || state.type]) {
        const Component = adapter[state.renderComponent || state.type];
        return (
          <Component
            {...state}
            placeholder={placeholder}
            value={field.value}
            onChange={handleChange}
          />
        );
      }
      switch (state.type) {
        case FormItemType.BOOLEAN:
          return (
            <CheckboxFormField
              {...state}
              value={Boolean(field.value)}
              onChange={handleChange as (v: boolean) => void}
            />
          );
        case FormItemType.NUMBER:
          return (
            <NumberFormField
              {...state}
              value={(field.value as number) ?? undefined}
              onChange={handleChange as (v: number) => void}
              placeholder={placeholder}
            />
          );
        case FormItemType.TEXT:
          return (
            <TextFormField
              {...state}
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={placeholder}
            />
          );
        case FormItemType.TEXTAREA:
          return (
            <TextAreaFormField
              {...state}
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={placeholder}
            />
          );
        case FormItemType.DATE:
          return (
            <DateFormField
              {...state}
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              placeholder={placeholder}
            />
          );
        case FormItemType.RADIO:
          return (
            <RadioGroupFormField
              {...state}
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as FormOption[]}
            />
          );
        case FormItemType.SELECT:
          return (
            <SelectFormField
              {...state}
              value={(field.value as string) ?? undefined}
              onChange={handleChange as (v: string) => void}
              options={(state.options || []) as FormOption[]}
              placeholder={placeholder}
            />
          );
        case FormItemType.ARRAY:
          return (
            <ArrayFormField
              {...state}
              fullFieldNameWithPath={fullFieldNameWithPath}
              structure={state.structure}
            />
          );
        case FormItemType.CHECKBOX:
          return (
            <CheckboxGroupFormField
              {...state}
              value={
                Array.isArray(field.value) ? (field.value as string[]) : []
              }
              onChange={handleChange as (v: string[]) => void}
              options={(state.options || []) as FormOption[]}
            />
          );
        default:
          return null;
      }
    },
    [label, state, adapter, onChange, form, fullFieldNameWithPath]
  );
  return (
    <>
      {state.visible !== false && (
        <RHFFormField<T, FieldPath<T>>
          control={control}
          name={fullFieldNameWithPath as FieldPath<T>}
          render={({
            field,
          }: {
            field: { value: unknown; onChange: (value: unknown) => void };
          }) => (
            <FormItem
              className={cn(
                "space-y-2",
                layout === "horizontal" &&
                  "grid grid-cols-1 sm:grid-cols-3 sm:items-center sm:space-y-0 gap-1",
                mergedClassNames.body
              )}
            >
              <FormLabel
                required={state.required}
                className={cn(
                  "text-sm sm:text-base font-medium !mb-0",
                  layout === "horizontal" && "sm:text-right",
                  mergedClassNames.label
                )}
              >
                {label}
              </FormLabel>
              <FormControl
                className={cn(
                  layout === "horizontal" && "sm:col-span-2",
                  mergedClassNames.field
                )}
              >
                <Component {...field} />
              </FormControl>
              <FormMessage
                className={cn(
                  "text-xs sm:text-sm",
                  layout === "horizontal" && "sm:col-start-2 sm:col-span-2"
                )}
              />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
