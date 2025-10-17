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
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  required?: boolean;
  structure?: FormFieldConfig[];
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

export type StringOption = { label: string; value: string; disabled?: boolean };
