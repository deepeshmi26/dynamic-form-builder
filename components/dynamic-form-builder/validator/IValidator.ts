import { FormFieldConfig } from "../types";

export interface IValidator<T> {
  validate(schema: unknown, data: unknown): { isValid: boolean; errors?: unknown };
  generateSchema(config: FormFieldConfig[]): T;
}
