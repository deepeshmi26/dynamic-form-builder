import Ajv, { ErrorObject } from "ajv";
import { FormFieldConfig, FormItemType } from "../types";
import { FieldErrors, FieldValues, Resolver } from "react-hook-form";

export interface IValidator<T> {
  validate(
    schema: unknown,
    data: unknown
  ): { isValid: boolean; errors?: unknown };
  generateSchema(config: FormFieldConfig[]): T;
}

export class AjvValidator implements IValidator<object> {
  private ajv: Ajv;
  private labelMapping: Record<string, string>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.labelMapping = {};
  }

  private getFieldValidation(
    field: FormFieldConfig,
    path: string = ""
  ): object {
    const currentPath = path ? `${path}/${field.name}` : field.name;
    if (typeof field.label === "string") {
      this.labelMapping[currentPath] = field.label;
    } else if (typeof field.alternateLabel === "string") {
      this.labelMapping[currentPath] = field.alternateLabel;
    }

    if (field.type === FormItemType.ARRAY && field.structure) {
      return {
        type: "array",
        items: {
          type: "object",
          properties: field.structure.reduce(
            (acc, structField) => ({
              ...acc,
              [structField.name]: this.getFieldValidation(
                structField,
                currentPath
              ),
            }),
            {}
          ),
          required: field.structure
            .filter((f) => f.required)
            .map((f) => f.name),
        },
      };
    }

    const schema: Record<string, unknown> = {
      ...field.validation,
      // type: "string",
    };

    if (field.required) {
      schema.minLength = 1;
    }

    if (field.validation?.minLength) {
      schema.minLength = field.validation.minLength;
    }

    return schema;
  }

  generateSchema(config: FormFieldConfig[]): object {
    // Reset label mapping for each schema generation
    this.labelMapping = {};

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

  customAjvResolver(
    schema: object,
    labels: Record<string, string> = {}
  ): Resolver<FieldValues> {
    const validate = this.ajv.compile(schema);

    return async (data) => {
      const valid = validate(data);

      if (valid) return { values: data, errors: {} };

      const errors: Record<string, FieldErrors<FieldValues>> = {};

      (validate.errors as ErrorObject[]).forEach((err) => {
        const field =
          err.instancePath.replace("/", "") ||
          (err.params as { missingProperty: string }).missingProperty;
        const label = this.labelMapping[field] || labels[field] || field;

        const message = label ? `${label} ${err.message}` : err.message;

        errors[field] = {
          type: err.keyword,
          message,
        } as unknown as FieldErrors<FieldValues>;
      }) as unknown as FieldErrors<FieldValues>;

      return { values: {}, errors };
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
