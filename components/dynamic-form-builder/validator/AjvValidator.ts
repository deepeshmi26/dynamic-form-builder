import Ajv, { ErrorObject } from "ajv";
import { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { FormFieldConfig, FormItemType } from "../types";

export class AjvValidator {
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
      ...field.validator,
    };

    if (field.required) {
      schema.minLength = 1;
    }

    if (field.validator?.minLength) {
      schema.minLength = field.validator.minLength;
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

  customAjvResolver(schema: object): Resolver<FieldValues> {
    return async (data) => {
      const validate = this.ajv.compile(schema);

      const valid = validate(data);

      if (valid) return { values: data, errors: {} };

      const errors: FieldErrors<FieldValues> = this.ajvToRHFErrors<FieldValues>(
        validate.errors as ErrorObject[]
      );

      return {
        values: {},
        errors,
      };
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

  private ajvToRHFErrors<T extends FieldValues>(
    ajvErrors: ErrorObject[] | null | undefined
  ): FieldErrors<T> {
    const fieldErrors: FieldErrors<T> = {};

    if (!ajvErrors?.length) return fieldErrors;

    const setNestedError = (
      obj: Record<string, unknown>,
      path: string,
      errorObj: { type: string; message: string }
    ) => {
      // Convert AJV path format (/field/0/subfield) to React Hook Form format (field.0.subfield)
      const normalizedPath = path.replace(/\//g, ".");
      const keys = normalizedPath.split(".").filter(Boolean);

      let current = obj;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLast = i === keys.length - 1;

        if (isLast) {
          current[key] = errorObj;
        } else {
          const nextKey = keys[i + 1];
          const isNextArray = !isNaN(Number(nextKey));

          if (!(key in current)) {
            current[key] = isNextArray ? [] : {};
          }

          current = current[key] as Record<string, unknown>;
        }
      }
    };

    for (const err of ajvErrors) {
      // Determine the actual field path
      const path =
        err.instancePath?.replace(/^\//, "") ||
        (err.params as { missingProperty?: string })?.missingProperty ||
        "";

      if (!path) continue;

      const message =
        this.labelMapping[path] + " " + err.message || "Invalid value";
      const errorObj = {
        type: err.keyword,
        message: message,
      };

      setNestedError(fieldErrors, path, errorObj);
    }

    return fieldErrors;
  }
}
