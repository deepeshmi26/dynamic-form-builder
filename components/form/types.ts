export enum FormItemType {
  SELECT = "SELECT",
  CHECKBOX = "CHECKBOX",
  RADIO = "RADIO",
  TEXT = "TEXT",
  ARRAY = "ARRAY",
}

export type FormOption = {
  value: string;
  label: string;
};

export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormItemType;
  options?: FormOption[];
  placeholder?: string;
};

export type StringOption = { label: string; value: string; disabled?: boolean };
