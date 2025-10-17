import { cn, formatJson, mergeDeep } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      expect(cn("base", true && "conditional")).toBe("base conditional");
      expect(cn("base", false && "conditional")).toBe("base");
    });

    it("should handle arrays of classes", () => {
      expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
    });

    it("should handle objects with boolean values", () => {
      expect(cn({ class1: true, class2: false })).toBe("class1");
    });

    it("should merge conflicting Tailwind classes", () => {
      expect(cn("px-2 px-4")).toBe("px-4");
      expect(cn("bg-red-500 bg-blue-500")).toBe("bg-blue-500");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
      expect(cn(null, undefined)).toBe("");
    });

    it("should handle mixed input types", () => {
      expect(cn("base", ["array1", "array2"], { object: true }, "string")).toBe(
        "base array1 array2 object string"
      );
    });
  });

  describe("formatJson", () => {
    it("should format valid JSON string", () => {
      const input = '{"name":"John","age":30}';
      const expected = `{
  "name": "John",
  "age": 30
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle JSON with trailing commas", () => {
      const input = '{"name":"John","age":30,}';
      const expected = `{
  "name": "John",
  "age": 30
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle nested objects", () => {
      const input = '{"user":{"name":"John","details":{"age":30}}}';
      const expected = `{
  "user": {
    "name": "John",
    "details": {
      "age": 30
    }
  }
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle arrays", () => {
      const input = '{"items":[1,2,3]}';
      const expected = `{
  "items": [
    1,
    2,
    3
  ]
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle arrays with trailing commas", () => {
      const input = '{"items":[1,2,3,]}';
      const expected = `{
  "items": [
    1,
    2,
    3
  ]
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should throw error for invalid JSON", () => {
      const invalidJson = '{"name":"John"';
      expect(() => formatJson(invalidJson)).toThrow();
    });

    it("should throw error for malformed JSON", () => {
      const malformedJson = '{"name":"John"';
      expect(() => formatJson(malformedJson)).toThrow();
    });

    it("should handle empty object", () => {
      const input = "{}";
      const expected = "{}";
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle empty array", () => {
      const input = "[]";
      const expected = "[]";
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle string values with special characters", () => {
      const input = '{"message":"Hello, world! \\"quoted\\""}';
      const expected = `{
  "message": "Hello, world! \\"quoted\\""
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle numeric values", () => {
      const input = '{"count":42,"price":19.99,"negative":-5}';
      const expected = `{
  "count": 42,
  "price": 19.99,
  "negative": -5
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle boolean values", () => {
      const input = '{"active":true,"disabled":false}';
      const expected = `{
  "active": true,
  "disabled": false
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it("should handle null values", () => {
      const input = '{"data":null}';
      const expected = `{
  "data": null
}`;
      expect(formatJson(input)).toBe(expected);
    });
  });

  describe("mergeDeep", () => {
    it("should merge simple objects", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("should merge nested objects", () => {
      const target = {
        user: {
          name: "John",
          age: 30,
        },
        settings: {
          theme: "dark",
        },
      };
      const source = {
        user: {
          age: 31,
          city: "NYC",
        },
        settings: {
          language: "en",
        },
      };
      const result = mergeDeep(target, source);

      expect(result).toEqual({
        user: {
          name: "John",
          age: 31,
          city: "NYC",
        },
        settings: {
          theme: "dark",
          language: "en",
        },
      });
    });

    it("should handle multiple sources", () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };
      const result = mergeDeep(target, source1, source2);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should not mutate original target", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const originalTarget = { ...target };

      mergeDeep(target, source);

      expect(target).toEqual(originalTarget);
    });

    it("should handle arrays by replacing them", () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5, 6] };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ items: [4, 5, 6] });
    });

    it("should handle null and undefined values", () => {
      const target = { a: 1, b: 2 };
      const source = { b: null, c: undefined };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ a: 1, b: null, c: undefined });
    });

    it("should handle empty objects", () => {
      const target = {};
      const source = { a: 1 };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ a: 1 });
    });

    it("should handle deeply nested objects", () => {
      const target = {
        level1: {
          level2: {
            level3: {
              value: "original",
            },
          },
        },
      };
      const source = {
        level1: {
          level2: {
            level3: {
              newValue: "added",
            },
          },
        },
      };
      const result = mergeDeep(target, source);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: "original",
              newValue: "added",
            },
          },
        },
      });
    });

    it("should handle mixed data types", () => {
      const target = {
        string: "hello",
        number: 42,
        boolean: true,
        object: { nested: "value" },
      };
      const source = {
        string: "world",
        number: 24,
        boolean: false,
        object: { newNested: "newValue" },
      };
      const result = mergeDeep(target, source);

      expect(result).toEqual({
        string: "world",
        number: 24,
        boolean: false,
        object: {
          nested: "value",
          newNested: "newValue",
        },
      });
    });

    it("should handle primitive values in source overriding objects in target", () => {
      const target = { value: { nested: "object" } };
      const source = { value: "primitive" };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ value: "primitive" });
    });

    it("should handle objects in source overriding primitive values in target", () => {
      const target = { value: "primitive" };
      const source = { value: { nested: "object" } };
      const result = mergeDeep(target, source);

      expect(result).toEqual({ value: { nested: "object" } });
    });
  });
});
