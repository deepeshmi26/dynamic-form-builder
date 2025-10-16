import { z } from "zod";
import Ajv from "ajv";
import { FormFieldConfig, FormItemType } from "../types";

export interface IValidator<T> {
  validate(schema: unknown, data: unknown): { isValid: boolean; errors?: any };
  generateSchema(config: FormFieldConfig[]): T;
}

export class ZodValidator implements IValidator<z.ZodObject<any>> {
  private getFieldValidation(field: FormFieldConfig): z.ZodTypeAny {
    if (field.type === FormItemType.ARRAY && field.structure) {
      return z.array(
        z.object(
          field.structure.reduce<z.ZodRawShape>(
            (acc, structField) => ({
              ...acc,
              [structField.name]: this.getFieldValidation(structField),
            }),
            {}
          )
        )
      );
    }

    let validation = z.string();
    if (field.required) validation = validation.min(1, "Required");
    if (field.validation?.min)
      validation = validation.min(field.validation.min);
    if (field.validation?.max)
      validation = validation.max(field.validation.max);
    if (field.validation?.pattern)
      validation = validation.regex(new RegExp(field.validation.pattern));
    return validation;
  }

  generateSchema(config: FormFieldConfig[]): z.ZodObject<any> {
    return z.object(
      config.reduce<z.ZodRawShape>(
        (acc, field) => ({
          ...acc,
          [field.name]: this.getFieldValidation(field),
        }),
        {}
      )
    );
  }

  validate(schema: z.ZodObject<any>, data: unknown) {
    const result = schema.safeParse(data);
    return {
      isValid: result.success,
      errors: !result.success ? result.error.format() : undefined,
    };
  }
}

export class AjvValidator implements IValidator<object> {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  private getFieldValidation(field: FormFieldConfig): object {
    if (field.type === FormItemType.ARRAY && field.structure) {
      return {
        type: "array",
        items: {
          type: "object",
          properties: field.structure.reduce(
            (acc, structField) => ({
              ...acc,
              [structField.name]: this.getFieldValidation(structField),
            }),
            {}
          ),
          required: field.structure
            .filter((f) => f.required)
            .map((f) => f.name),
        },
      };
    }

    // Base schema with validation from field.validation
    const schema: Record<string, unknown> = {
      ...field.validation, // Pass through all validation rules
      type: "string",
    };

    // Special handling for required fields
    if (field.required) {
      schema.minLength = 1;
    }

    return schema;
  }

  generateSchema(config: FormFieldConfig[]): object {
    return {
      type: "object",
      properties: config.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: this.getFieldValidation(field),
        }),
        {}
      ),
      required: config.filter((f) => f.required).map((f) => f.name),
    };
  }

  validate(schema: object, data: unknown) {
    const validate = this.ajv.compile(schema);
    const isValid = validate(data);
    return {
      isValid,
      errors: !isValid ? validate.errors : undefined,
    };
  }
}
