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

export type FormSettings = {
  layout?: "vertical" | "horizontal";
  className?: string;
  defaultClassNames?: {
    body?: string;
    label?: string;
    field?: string;
  };
};

export type FormConfig = {
  label?: string;
  settings?: FormSettings;
  fields?: FormFieldConfig[];
};

export type FormFieldConfig = {
  name: string;
  label: React.ReactNode;
  alternateLabel?: React.ReactNode;
  type: FormItemType;
  options?: FormOption[];
  placeholder?: string;
  validation?: Record<string, unknown>;
  visible?: boolean;
  required?: boolean;
  structure?: FormFieldConfig[];
  classNames?: {
    body?: string;
    label?: string;
    field?: string;
  };
  onConditionMatch?: {
    if: {
      properties: Record<string, { const: string }>;
    };
    then?: Record<string, Partial<FormFieldConfig>>;
    else?: Record<string, Partial<FormFieldConfig>>;
  }[];
  [key: string]: unknown;

};

export type FormProps<T extends FieldValues> = {
  formConfig: FormConfig;
  onSubmit?: SubmitHandler<T>;
  adapter?: Record<string, React.ComponentType<Record<string, unknown>>>;
  initialValues?: DefaultValues<T>;
  onChange?: (fieldName: string, value: unknown, allValues: T) => void;
  registerOnChangeRecord?: (fieldConfig: FormFieldConfig) => void;
};

export type RegistryEntry<T extends FieldValues> = {
  config: FormFieldConfig & { name: FieldPath<T> };
  initialConfig: FormFieldConfig & { name: FieldPath<T> };
  setState: (state: unknown) => void;
};

export type ChangeRule<T extends FieldValues> = {
  if: object;
  then: Record<string, Partial<FormFieldConfig>>;
  else: Record<string, Partial<FormFieldConfig>>;
  target: Path<T>;
};

export type FormRegistryContext<T extends FieldValues> = {
  register?: (
    name: string,
    config: FormFieldConfig & { name: string },
    setStateCall: (state: unknown) => void
  ) => void;
  unregister?: (name: string) => void;
  registry?: Record<string, RegistryEntry<T>>;
  onChangeRecord?: Record<string, ChangeRule<T>[]>;
  registerOnChangeRecord?: (fieldConfig: FormFieldConfig) => void;
  updateState?: (newConfig: FormFieldConfig & { name: string }) => void;
  adapter?: Record<string, React.ComponentType<Record<string, unknown>>>;
  onChange?: (fieldName: string, value: unknown, allValues: T) => void;
};
