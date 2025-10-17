import {
  FormFieldConfig,
  FormItemType,
} from "@/components/dynamic-form-builder/types";
import { AjvValidator } from "@/components/dynamic-form-builder/validator/AjvValidator";

describe("AjvValidator", () => {
  let validator: AjvValidator;

  beforeEach(() => {
    validator = new AjvValidator();
  });

  describe("generateSchema", () => {
    it("should generate schema for simple text field", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "name",
          label: "Name",
          type: FormItemType.TEXT,
          required: true,
        },
      ];

      const schema = validator.generateSchema(fields);

      expect(schema).toEqual({
        type: "object",
        properties: {
          name: {
            minLength: 1,
          },
        },
        required: ["name"],
      });
    });

    it("should generate schema for optional field", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "email",
          label: "Email",
          type: FormItemType.TEXT,
          required: false,
        },
      ];

      const schema = validator.generateSchema(fields);

      expect(schema).toEqual({
        type: "object",
        properties: {
          email: {},
        },
        required: [],
      });
    });

    it("should generate schema for field with validation rules", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "age",
          label: "Age",
          type: FormItemType.TEXT,
          required: true,
          validation: {
            minLength: 2,
            maxLength: 3,
          },
        },
      ];

      const schema = validator.generateSchema(fields);

      expect(schema).toEqual({
        type: "object",
        properties: {
          age: {
            minLength: 2,
            maxLength: 3,
          },
        },
        required: ["age"],
      });
    });

    it("should generate schema for array field", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "items",
          label: "Items",
          type: FormItemType.ARRAY,
          required: true,
          structure: [
            {
              name: "title",
              label: "Title",
              type: FormItemType.TEXT,
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: FormItemType.TEXT,
              required: false,
            },
          ],
        },
      ];

      const schema = validator.generateSchema(fields);

      expect(schema).toEqual({
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: {
                  minLength: 1,
                },
                description: {},
              },
              required: ["title"],
            },
          },
        },
        required: ["items"],
      });
    });
  });

  describe("validate", () => {
    it("should validate correct data", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "name",
          label: "Name",
          type: FormItemType.TEXT,
          required: true,
        },
      ];

      const schema = validator.generateSchema(fields);
      const result = validator.validate(schema, { name: "John Doe" });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate incorrect data", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "name",
          label: "Name",
          type: FormItemType.TEXT,
          required: true,
        },
      ];

      const schema = validator.generateSchema(fields);
      const result = validator.validate(schema, { name: "" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should validate array data", () => {
      const fields: FormFieldConfig[] = [
        {
          name: "items",
          label: "Items",
          type: FormItemType.ARRAY,
          required: true,
          structure: [
            {
              name: "title",
              label: "Title",
              type: FormItemType.TEXT,
              required: true,
            },
          ],
        },
      ];

      const schema = validator.generateSchema(fields);
      const validData = {
        items: [{ title: "Item 1" }, { title: "Item 2" }],
      };
      const invalidData = {
        items: [{ title: "" }],
      };

      const validResult = validator.validate(schema, validData);
      const invalidResult = validator.validate(schema, invalidData);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });
});
