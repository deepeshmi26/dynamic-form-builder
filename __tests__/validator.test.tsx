import Ajv from "ajv";
import { buildAjvSchemaFromPath } from "@/components/dynamic-form-builder/utils";

const ajv = new Ajv();

describe("buildAjvSchemaFromPath", () => {
  test("handles nested array path correctly", () => {
    const schema = buildAjvSchemaFromPath("socialHandles.0.platform", {
      type: "object",
      properties: { platform: { const: "linkedin" } },
    });

    const expected = {
      type: "object",
      properties: {
        socialHandles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { const: "linkedin" },
            },
          },
        },
      },
    };

    expect(schema).toEqual(expected);

    const validate = ajv.compile(schema);
    expect(validate({ socialHandles: [{ platform: "linkedin" }] })).toBe(true);
    expect(validate({ socialHandles: [{ platform: "twitter" }] })).toBe(false);
  });

  test("returns root validator unchanged for empty path", () => {
    const schema = buildAjvSchemaFromPath("", {
      type: "object",
      properties: { position: { const: "developer" } },
    });

    const expected = {
      type: "object",
      properties: { position: { const: "developer" } },
    };

    expect(schema).toEqual(expected);

    const validate = ajv.compile(schema);
    expect(validate({ position: "developer" })).toBe(true);
    expect(validate({ position: "tester" })).toBe(false);
  });

  test("wraps single-level object path correctly", () => {
    const schema = buildAjvSchemaFromPath("job", {
      type: "object",
      properties: { title: { const: "engineer" } },
    });

    const expected = {
      type: "object",
      properties: {
        job: {
          type: "object",
          properties: { title: { const: "engineer" } },
        },
      },
    };

    expect(schema).toEqual(expected);

    const validate = ajv.compile(schema);
    expect(validate({ job: { title: "engineer" } })).toBe(true);
    expect(validate({ job: { title: "manager" } })).toBe(false);
  });

  test("supports multiple nested arrays", () => {
    const schema = buildAjvSchemaFromPath("teams.0.members.0.name", {
      type: "object",
      properties: { name: { const: "Alice" } },
    });

    const expected = {
      type: "object",
      properties: {
        teams: {
          type: "array",
          items: {
            type: "object",
            properties: {
              members: {
                type: "array",
                items: {
                  type: "object",
                  properties: { name: { const: "Alice" } },
                },
              },
            },
          },
        },
      },
    };

    expect(schema).toEqual(expected);

    const validate = ajv.compile(schema);
    expect(validate({ teams: [{ members: [{ name: "Alice" }] }] })).toBe(true);
    expect(validate({ teams: [{ members: [{ name: "Bob" }] }] })).toBe(false);
  });

  test("does not double-wrap when validator already has type: object", () => {
    const schema = buildAjvSchemaFromPath("department", {
      type: "object",
      properties: { id: { const: 1 } },
    });

    const expected = {
      type: "object",
      properties: {
        department: {
          type: "object",
          properties: { id: { const: 1 } },
        },
      },
    };

    expect(schema).toEqual(expected);

    const validate = ajv.compile(schema);
    expect(validate({ department: { id: 1 } })).toBe(true);
    expect(validate({ department: { id: 2 } })).toBe(false);
  });

  test("idempotence: re-building same path twice yields same schema", () => {
    const validator = {
      type: "object",
      properties: { name: { const: "Deepesh" } },
    };

    const s1 = buildAjvSchemaFromPath("profile.0.user", validator);
    const s2 = buildAjvSchemaFromPath("profile.0.user", validator);

    expect(s1).toEqual(s2);
  });
});
