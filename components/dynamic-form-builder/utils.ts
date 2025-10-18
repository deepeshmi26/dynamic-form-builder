import Ajv from "ajv";
export function getFullFieldNameWithPath(
  fieldName: string,
  parentPath?: string
) {
  return parentPath ? `${parentPath}.${fieldName}` : fieldName;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAjvSchemaFromPath(path: string, validator: any) {
  const segments = path.split(".");
  let schema = validator;

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const isArrayIndex = /^\d+$/.test(segment);

    if (isArrayIndex) {
      schema = {
        type: "array",
        items: schema,
      };
    } else {
      // Only wrap if validator doesn't already have `properties[segment]`
      const alreadyHasProperties =
        schema.type === "object" &&
        schema.properties &&
        schema.properties[segment];

      if (alreadyHasProperties) {
        // No need to wrap again — just continue upward
        schema = {
          type: "object",
          properties: {
            [segment]: schema.properties[segment],
          },
        };
      } else {
        schema = {
          type: "object",
          properties: {
            [segment]: schema,
          },
        };
      }
    }
  }

  return schema;
}

export function validateAjv(schema: object, data: unknown) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const isValid = validate(data);
  return {
    isValid,
    errors: !isValid ? validate.errors : undefined,
  };
}
