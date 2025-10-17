import { z } from "zod";
import { FormFieldConfig, FormItemType } from "../types";
import { IValidator } from "./IValidator";

export class ZodValidator implements IValidator<z.ZodObject<z.ZodRawShape>> {
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
      validation = validation.min(field.validation.min as number);
    if (field.validation?.max)
      validation = validation.max(field.validation.max as number);
    if (field.validation?.pattern)
      validation = validation.regex(
        new RegExp(field.validation.pattern as string)
      );
    return validation;
  }

  generateSchema(config: FormFieldConfig[]): z.ZodObject<z.ZodRawShape> {
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

  validate(schema: z.ZodObject<z.ZodRawShape>, data: unknown) {
    const result = schema.safeParse(data);
    return {
      isValid: result.success,
      errors: !result.success ? result.error.format() : undefined,
    };
  }
}
