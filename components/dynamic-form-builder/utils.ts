import Ajv from "ajv";
export function getFullFieldNameWithPath(
  fieldName: string,
  parentPath?: string
) {
  return parentPath ? `${parentPath}.${fieldName}` : fieldName;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAjvSchemaFromPath(path: string, validator: object) {
  const segments = path ? path.split(".") : [];
  let schema = validator;

  // Walk backward up the path
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const isArrayIndex = /^\d+$/.test(segment);

    if (isArrayIndex) {
      schema = {
        type: "array",
        items: schema,
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

  // ✅ If path is empty, just ensure top-level object typing if missing
  if (segments.length === 0) {
    // Add `type: "object"` if not explicitly specified
    if (!('type' in schema)) {
      schema = {
        type: "object",
        ...schema,
      };
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
