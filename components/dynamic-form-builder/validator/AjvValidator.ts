import Ajv from "ajv";
import { FormFieldConfig, FormItemType } from "../types";
import { IValidator } from "./IValidator";

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

    const schema: Record<string, unknown> = {
      ...field.validation,
      type: "string",
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
