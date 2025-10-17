import {
  DefaultValues,
  FieldPath,
  FieldValues,
  Path,
  SubmitHandler,
} from "react-hook-form";
export enum FormItemType {
  SELECT = "SELECT",
  CHECKBOX = "CHECKBOX",
  BOOLEAN = "BOOLEAN",
  RADIO = "RADIO",
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  DATE = "DATE",
  ARRAY = "ARRAY",
}

export type FormOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormConfig = {
  label?: string;
  settings?: {
    layout?: "vertical" | "horizontal";
    className?: string; // Applied to the fields container
    defaultClassNames?: {
      body?: string; // Applied to all field containers by default
      label?: string; // Applied to all field labels by default
      field?: string; // Applied to all field inputs by default
    };
  };
  fields?: FormFieldConfig[];
};

export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormItemType;
  options?: FormOption[];
  placeholder?: string;
  validation?: Record<string, unknown>;
  required?: boolean;
  structure?: FormFieldConfig[];
  classNames?: {
    body?: string; // Applied to the container containing label & field
    label?: string; // Applied only on the label
    field?: string; // Applied only on the field
  };
  onConditionMatch?: {
    if: {
      properties: {
        [key: string]: {
          const: string;
        };
      };
    };
    then?: Record<string, Partial<FormFieldConfig>>;
    else?: Record<string, Partial<FormFieldConfig>>;
  }[];
};

export type FormGenratorProps<TFieldValues extends FieldValues> = {
  formConfig: FormConfig;
  onSubmit?: SubmitHandler<TFieldValues>;
  adapter?: Record<
    string,
    React.ComponentType<{
      value?: unknown;
      name?: string;
      structure?: FormFieldConfig[];
      path?: string;
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

export type RegistryEntry<TFieldValues extends FieldValues> = {
  config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> };
  initialConfig: Omit<FormFieldConfig, "name"> & {
    name: FieldPath<TFieldValues>;
  };
  setState: (state: unknown) => void;
};

export type ChangeRule<TFieldValues extends FieldValues> = {
  if: object;
  then: Record<string, Partial<FormFieldConfig>>;
  else: Record<string, Partial<FormFieldConfig>>;
  target: Path<TFieldValues>;
};

export type FormRegistryContextType<TFieldValues extends FieldValues> = {
  register?: (
    name: Path<TFieldValues>,
    config: Omit<FormFieldConfig, "name"> & { name: FieldPath<TFieldValues> },
    setStateCall: (state: TFieldValues[keyof TFieldValues]) => void
  ) => void;
  unregister?: (name: Path<TFieldValues>) => void;
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
