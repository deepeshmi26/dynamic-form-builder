import { useFormBuilder } from "../components/dynamic-form-builder/hooks/useFormBuilder";
import {
  FormConfig,
  FormItemType,
  FormRegistryContext,
} from "../components/dynamic-form-builder/types";
import { render, waitFor } from "@testing-library/react";
import React, { useEffect, act } from "react";

// Mock debounce to avoid timing issues in tests
jest.mock("lodash", () => ({
  debounce: (fn: unknown) => fn,
}));

describe("Conditional Field Rendering Tests", () => {
  // Test component that exposes registry functions for testing
  const TestComponent = ({
    formConfig,
    onSubmit,
    onChange,
    adapter,
    onRegistryChange,
  }: {
    formConfig: FormConfig;
    onSubmit?: unknown;
    onChange?: unknown;
    adapter?: unknown;
    onRegistryChange?: (context: FormRegistryContext<unknown>) => void;
  }) => {
    const { form, contextValue } = useFormBuilder({
      formConfig,
      onSubmit,
      onChange,
      adapter,
    });

    useEffect(() => {
      if (onRegistryChange && contextValue) {
        onRegistryChange(contextValue);
      }
    }, [contextValue, onRegistryChange]);

    return (
      <div>
        <div data-testid="form-control">
          {form.control ? "Form control exists" : "No form control"}
        </div>
        <div data-testid="registry-keys">
          {contextValue?.registry
            ? Object.keys(contextValue.registry).join(",")
            : ""}
        </div>
        <div data-testid="onChangeRecord-keys">
          {contextValue?.onChangeRegistry
            ? Object.keys(contextValue.onChangeRegistry).join(",")
            : ""}
        </div>
      </div>
    );
  };

  describe("Registry Functions Testing", () => {
    it("should register field and update registry", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "testField",
            label: "Test Field",
            type: FormItemType.TEXT,
            required: false,
          },
        ],
      };

      const mockSetState = jest.fn();

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Test register function
      act(() => {
        capturedContext?.register?.(
          "testField",
          {
            name: "testField",
            label: "Test Field",
            type: FormItemType.TEXT,
            required: true,
          },
          mockSetState
        );
      });

      await waitFor(() => {
        expect(capturedContext?.registry?.["testField"]).toBeDefined();
        expect(
          (capturedContext?.registry?.["testField"] as any).config.name
        ).toBe("testField");
        expect(
          (capturedContext?.registry?.["testField"] as any).config.required
        ).toBe(true);
      });
    });

    it("should append conditions to onChangeRegistry for each key", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: { targetField: { required: true } },
                else: { targetField: { required: false } },
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option2" } } },
                then: { anotherField: { visible: true } },
                else: { anotherField: { visible: false } },
              },
            ],
          },
          {
            name: "anotherField",
            label: "Another Field",
            type: FormItemType.TEXT,
            visible: false,
          },
        ],
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register first field with conditions
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
      });

      // Check initial condition count
      await waitFor(() => {
        expect(
          capturedContext?.onChangeRegistry?.["triggerField"]
        ).toBeDefined();
        expect(capturedContext?.onChangeRegistry?.["triggerField"].length).toBe(
          1
        );
      });

      const initialConditionCount =
        capturedContext?.onChangeRegistry?.["triggerField"].length;

      // Register second field that also has conditions affecting the same trigger field
      act(() => {
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          jest.fn()
        );
      });

      // Verify that conditions were appended (not replaced)
      await waitFor(() => {
        expect(
          capturedContext?.onChangeRegistry?.["triggerField"]
        ).toBeDefined();
        expect(
          capturedContext?.onChangeRegistry?.["triggerField"].length
        ).toBeGreaterThan(initialConditionCount);
      });

      // Register third field
      act(() => {
        capturedContext?.register?.(
          "anotherField",
          mockFormConfig.fields![2],
          jest.fn()
        );
      });

      // Verify the onChangeRegistry structure is correct
      await waitFor(() => {
        expect(capturedContext?.onChangeRegistry).toBeDefined();
        expect(typeof capturedContext?.onChangeRegistry).toBe("object");

        // Check that triggerField has an array of conditions
        expect(
          Array.isArray(capturedContext?.onChangeRegistry?.["triggerField"])
        ).toBe(true);

        // Check that each condition has the expected structure
        const conditions = capturedContext?.onChangeRegistry?.["triggerField"];
        conditions?.forEach((condition) => {
          expect(condition).toHaveProperty("if");
          expect(condition).toHaveProperty("then");
          expect(condition).toHaveProperty("else");
        });
      });
    });

    it("should unregister field and clean up both registries", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "fieldToRemove",
            label: "Field To Remove",
            type: FormItemType.TEXT,
            required: false,
          },
        ],
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register field
      act(() => {
        capturedContext?.register?.(
          "fieldToRemove",
          mockFormConfig.fields![0],
          jest.fn()
        );
      });

      await waitFor(() => {
        expect(capturedContext?.registry?.["fieldToRemove"]).toBeDefined();
      });

      // Unregister field
      act(() => {
        capturedContext?.unregister?.("fieldToRemove");
      });

      await waitFor(() => {
        expect(capturedContext?.registry?.["fieldToRemove"]).toBeUndefined();
        expect(
          capturedContext?.onChangeRegistry?.["fieldToRemove"]
        ).toBeUndefined();
      });
    });
  });

  describe("evaluateCondition Testing", () => {
    it("should handle else block not present", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: { targetField: { required: true, visible: true } },
                // No else block
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            visible: false,
          },
        ],
        initialValues: { triggerField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalled();
      });

      // Verify target field was updated
      const calls = mockSetState.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.required).toBe(true);
      expect(lastCall.visible).toBe(true);
    });

    it("should handle else block present", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: { targetField: { required: true, visible: true } },
                else: { targetField: { required: false, visible: false } },
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            visible: true,
          },
        ],
        initialValues: { triggerField: "option2" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalled();
      });

      // Verify target field was updated with else condition
      const calls = mockSetState.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.required).toBe(false);
      expect(lastCall.visible).toBe(false);
    });

    it("should handle multiple conditionals", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: { targetField: { required: true } },
                else: { targetField: { required: false } },
              },
              {
                if: { properties: { triggerField: { const: "option2" } } },
                then: { targetField: { visible: true } },
                else: { targetField: { visible: false } },
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            visible: false,
          },
        ],
        initialValues: { triggerField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalled();
      });

      // Verify target field was updated with merged conditions
      const calls = mockSetState.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.required).toBe(true);
      expect(lastCall.visible).toBe(false); // Second condition's else block
    });

    it("should reset field to initial value if no conditional updated it", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: { targetField: { required: true } },
                else: { targetField: { required: false } },
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            visible: true,
          },
        ],
        initialValues: { triggerField: "option2" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalled();
      });

      // Verify target field was reset to initial state
      const calls = mockSetState.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.required).toBe(false);
      expect(lastCall.visible).toBe(true);
    });

    it("should merge changes from multiple conditionals", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: {
                  targetField: {
                    required: true,
                    placeholder: "Required field",
                  },
                },
                else: { targetField: { required: false } },
              },
              {
                if: { properties: { triggerField: { const: "option1" } } },
                then: {
                  targetField: { visible: true, label: "Updated Label" },
                },
                else: { targetField: { visible: false } },
              },
            ],
          },
          {
            name: "targetField",
            label: "Target Field",
            type: FormItemType.TEXT,
            required: false,
            visible: false,
          },
        ],
        initialValues: { triggerField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "triggerField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "targetField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalled();
      });

      // Verify target field was updated with merged changes from both conditionals
      const calls = mockSetState.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.required).toBe(true);
      expect(lastCall.visible).toBe(true);
      expect(lastCall.placeholder).toBe("Required field");
      expect(lastCall.label).toBe("Updated Label");
    });
  });

  describe("UI Integration Testing", () => {
    it("should make text field mandatory when select value is selected", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "selectField",
            label: "Select Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { selectField: { const: "option1" } } },
                then: { textField: { required: true } },
                else: { textField: { required: false } },
              },
            ],
          },
          {
            name: "textField",
            label: "Text Field",
            type: FormItemType.TEXT,
            required: false,
          },
        ],
        initialValues: { selectField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "selectField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "textField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation based on initial values
      await waitFor(() => {
        // Check that setState was called with required: true due to initial value
        const calls = mockSetState.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.required).toBe(true);
      });

      // Test that the conditional logic is properly set up
      // The onChange function will be called when the form value changes
      // For now, we'll test that the initial evaluation worked correctly
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ required: true })
      );
    });

    it("should make text field visible when select value is selected", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "selectField",
            label: "Select Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { selectField: { const: "option1" } } },
                then: { textField: { visible: true } },
                else: { textField: { visible: false } },
              },
            ],
          },
          {
            name: "textField",
            label: "Text Field",
            type: FormItemType.TEXT,
            visible: false,
          },
        ],
        initialValues: { selectField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "selectField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "textField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation based on initial values
      await waitFor(() => {
        // Check that setState was called with visible: true due to initial value
        const calls = mockSetState.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.visible).toBe(true);
      });

      // Test that the conditional logic is properly set up
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true })
      );
    });

    it("should update Select2 options based on Select1 selection", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState1 = jest.fn();
      const mockSetState2 = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "select1",
            label: "Select 1",
            type: FormItemType.SELECT,
            options: [
              { value: "category1", label: "Category 1" },
              { value: "category2", label: "Category 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { select1: { const: "category1" } } },
                then: {
                  select2: {
                    options: [
                      { value: "sub1", label: "Sub Option 1" },
                      { value: "sub2", label: "Sub Option 2" },
                    ],
                  },
                },
                else: {
                  select2: {
                    options: [
                      { value: "sub3", label: "Sub Option 3" },
                      { value: "sub4", label: "Sub Option 4" },
                    ],
                  },
                },
              },
            ],
          },
          {
            name: "select2",
            label: "Select 2",
            type: FormItemType.SELECT,
            options: [{ value: "default", label: "Default Option" }],
          },
        ],
        initialValues: { select1: "category1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "select1",
          mockFormConfig.fields![0],
          mockSetState1
        );
        capturedContext?.register?.(
          "select2",
          mockFormConfig.fields![1],
          mockSetState2
        );
      });

      // Wait for initial evaluation based on initial values
      await waitFor(() => {
        // Check that setState was called with category1 options due to initial value
        const calls = mockSetState2.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.options).toEqual([
          { value: "sub1", label: "Sub Option 1" },
          { value: "sub2", label: "Sub Option 2" },
        ]);
      });

      // Test that the conditional logic is properly set up
      expect(mockSetState2).toHaveBeenCalledWith(
        expect.objectContaining({
          options: [
            { value: "sub1", label: "Sub Option 1" },
            { value: "sub2", label: "Sub Option 2" },
          ],
        })
      );
    });
  });

  describe("Initial Values with Conditional Logic", () => {
    it("should evaluate conditions on first run when initialValue is passed", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "selectField",
            label: "Select Field",
            type: FormItemType.SELECT,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            onConditionMatch: [
              {
                if: { properties: { selectField: { const: "option1" } } },
                then: { textField: { required: true, visible: true } },
                else: { textField: { required: false, visible: false } },
              },
            ],
          },
          {
            name: "textField",
            label: "Text Field",
            type: FormItemType.TEXT,
            required: false,
            visible: false,
          },
        ],
        initialValues: { selectField: "option1" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register fields
      act(() => {
        capturedContext?.register?.(
          "selectField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "textField",
          mockFormConfig.fields![1],
          mockSetState
        );
      });

      // Wait for initial evaluation based on initial values
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalledWith(
          expect.objectContaining({
            required: true,
            visible: true,
          })
        );
      });
    });

    it("should handle complex nested conditions with initial values", async () => {
      let capturedContext: FormRegistryContext<unknown> | null = null;
      const mockSetState = jest.fn();

      const mockFormConfig: FormConfig = {
        fields: [
          {
            name: "primaryField",
            label: "Primary Field",
            type: FormItemType.SELECT,
            options: [
              { value: "enable", label: "Enable" },
              { value: "disable", label: "Disable" },
            ],
            onConditionMatch: [
              {
                if: { properties: { primaryField: { const: "enable" } } },
                then: {
                  secondaryField: { visible: true },
                  tertiaryField: { required: true },
                },
                else: {
                  secondaryField: { visible: false },
                  tertiaryField: { required: false },
                },
              },
            ],
          },
          {
            name: "secondaryField",
            label: "Secondary Field",
            type: FormItemType.TEXT,
            visible: false,
          },
          {
            name: "tertiaryField",
            label: "Tertiary Field",
            type: FormItemType.TEXT,
            required: false,
          },
        ],
        initialValues: { primaryField: "enable" },
      };

      render(
        <TestComponent
          formConfig={mockFormConfig}
          onRegistryChange={(context) => {
            capturedContext = context;
          }}
        />
      );

      await waitFor(() => {
        expect(capturedContext).toBeTruthy();
      });

      // Register all fields
      act(() => {
        capturedContext?.register?.(
          "primaryField",
          mockFormConfig.fields![0],
          jest.fn()
        );
        capturedContext?.register?.(
          "secondaryField",
          mockFormConfig.fields![1],
          jest.fn()
        );
        capturedContext?.register?.(
          "tertiaryField",
          mockFormConfig.fields![2],
          mockSetState
        );
      });

      // Wait for initial evaluation based on initial values
      await waitFor(() => {
        expect(mockSetState).toHaveBeenCalledWith(
          expect.objectContaining({
            required: true,
          })
        );
      });
    });
  });
});
