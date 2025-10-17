import { useFormBuilder } from "../components/dynamic-form-builder/hooks/useFormBuilder";
import {
  FormConfig,
  FormItemType,
} from "../components/dynamic-form-builder/types";
import { render, screen } from "@testing-library/react";
import React from "react";

// Test the useFormBuilder hook directly
describe("useFormBuilder Hook", () => {
  // We need to test this hook in isolation, so we'll create a test component
  const TestComponent = ({
    formConfig,
    onSubmit,
    onChange,
    adapter,
    initialValues,
  }: any) => {
    const { form, handleSubmit, contextValue } = useFormBuilder({
      formConfig,
      onSubmit,
      onChange,
      adapter,
      initialValues,
    });

    return (
      <div>
        <div data-testid="form-control">
          {form.control ? "Form control exists" : "No form control"}
        </div>
        <div data-testid="handle-submit">
          {handleSubmit ? "Handle submit exists" : "No handle submit"}
        </div>
        <div data-testid="context-value">
          {contextValue ? "Context value exists" : "No context value"}
        </div>
        <div data-testid="registry">
          {contextValue?.registry ? "Registry exists" : "No registry"}
        </div>
        <div data-testid="onChangeRecord">
          {contextValue?.onChangeRecord
            ? "OnChangeRecord exists"
            : "No onChangeRecord"}
        </div>
      </div>
    );
  };

  const mockFormConfig: FormConfig = {
    fields: [
      {
        name: "test",
        label: "Test",
        type: FormItemType.TEXT,
        required: true,
      },
    ],
  };

  it("should initialize form with default values", () => {
    const initialValues = { test: "initial value" };

    render(
      <TestComponent
        formConfig={mockFormConfig}
        initialValues={initialValues}
      />
    );

    expect(screen.getByTestId("form-control")).toHaveTextContent(
      "Form control exists"
    );
    expect(screen.getByTestId("handle-submit")).toHaveTextContent(
      "Handle submit exists"
    );
    expect(screen.getByTestId("context-value")).toHaveTextContent(
      "Context value exists"
    );
  });

  it("should handle form submission", () => {
    const mockOnSubmit = jest.fn();

    render(
      <TestComponent formConfig={mockFormConfig} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByTestId("handle-submit")).toHaveTextContent(
      "Handle submit exists"
    );
  });

  it("should handle field changes", () => {
    const mockOnChange = jest.fn();

    render(
      <TestComponent formConfig={mockFormConfig} onChange={mockOnChange} />
    );

    expect(screen.getByTestId("context-value")).toHaveTextContent(
      "Context value exists"
    );
  });

  it("should handle adapter configuration", () => {
    const mockAdapter = {
      CUSTOM_FIELD: jest.fn(),
    };

    render(<TestComponent formConfig={mockFormConfig} adapter={mockAdapter} />);

    expect(screen.getByTestId("context-value")).toHaveTextContent(
      "Context value exists"
    );
  });

  // Specialized tests for useFormBuilder hook
  describe("useFormBuilder Registry Management", () => {
    let TestRegistryComponent: React.FC<any>;
    let mockSetState: jest.Mock;

    beforeEach(() => {
      mockSetState = jest.fn();

      TestRegistryComponent = ({ formConfig, onMount, onUnmount }: any) => {
        const { contextValue } = useFormBuilder({ formConfig });

        React.useEffect(() => {
          if (onMount) onMount(contextValue);
        }, [contextValue, onMount]);

        React.useEffect(() => {
          return () => {
            if (onUnmount) onUnmount(contextValue);
          };
        }, [contextValue, onUnmount]);

        return <div data-testid="registry-component">Registry Component</div>;
      };
    });

    it("1. Register should be called when component is mounting", () => {
      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={mockFormConfig}
          onMount={mockOnMount}
        />
      );

      expect(mockOnMount).toHaveBeenCalled();
      const contextValue = mockOnMount.mock.calls[0][0];
      expect(contextValue.register).toBeDefined();
      expect(contextValue.unregister).toBeDefined();
      expect(contextValue.updateState).toBeDefined();
    });

    it("2. Register should save the config, initialConfig, setState call & also store registerOnChangeRecord", () => {
      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={mockFormConfig}
          onMount={mockOnMount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Simulate registering a field
      const fieldConfig = {
        name: "testField",
        label: "Test Field",
        type: FormItemType.TEXT,
        required: true,
      };

      contextValue.register("testField", fieldConfig, mockSetState);

      expect(contextValue.registry["testField"]).toBeDefined();
      expect(contextValue.registry["testField"].config).toEqual(fieldConfig);
      expect(contextValue.registry["testField"].initialConfig).toEqual(
        fieldConfig
      );
      expect(contextValue.registry["testField"].setState).toBe(mockSetState);
    });

    it("3. registerOnChangeRecord should be called when registering field and store necessary values", () => {
      const formConfigWithConditions: FormConfig = {
        fields: [
          {
            name: "dependentField",
            label: "Dependent Field",
            type: FormItemType.TEXT,
            onConditionMatch: [
              {
                if: {
                  properties: {
                    triggerField: { const: "value1" },
                  },
                },
                then: {
                  visible: true,
                  required: true,
                },
                else: {
                  visible: false,
                  required: false,
                },
              },
            ],
          },
        ],
      };

      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={formConfigWithConditions}
          onMount={mockOnMount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Register the field with conditions
      const fieldConfig = formConfigWithConditions.fields![0];
      contextValue.register("dependentField", fieldConfig, mockSetState);

      // Check that onChangeRecord was populated
      expect(contextValue.onChangeRecord["triggerField"]).toBeDefined();
      expect(contextValue.onChangeRecord["triggerField"]).toHaveLength(1);

      const changeRule = contextValue.onChangeRecord["triggerField"][0];
      expect(changeRule.target).toBe("dependentField");
      expect(changeRule.then).toEqual({
        visible: true,
        required: true,
      });
      expect(changeRule.else).toEqual({
        visible: false,
        required: false,
      });
    });

    it("4. registerOnChangeRecord should not update if the same component calls it again", () => {
      const formConfigWithConditions: FormConfig = {
        fields: [
          {
            name: "dependentField",
            label: "Dependent Field",
            type: FormItemType.TEXT,
            onConditionMatch: [
              {
                if: {
                  properties: {
                    triggerField: { const: "value1" },
                  },
                },
                then: {
                  visible: true,
                },
              },
            ],
          },
        ],
      };

      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={formConfigWithConditions}
          onMount={mockOnMount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Register the field first time
      const fieldConfig = formConfigWithConditions.fields![0];
      contextValue.register("dependentField", fieldConfig, mockSetState);

      const initialRecordCount =
        contextValue.onChangeRecord["triggerField"]?.length || 0;

      // Try to register the same field again
      contextValue.register("dependentField", fieldConfig, mockSetState);

      // Should not add duplicate records
      expect(contextValue.onChangeRecord["triggerField"]?.length).toBe(
        initialRecordCount
      );
    });

    it("5. unregister should be called when component is unmounting", () => {
      const mockOnMount = jest.fn();
      const mockOnUnmount = jest.fn();

      const { unmount } = render(
        <TestRegistryComponent
          formConfig={mockFormConfig}
          onMount={mockOnMount}
          onUnmount={mockOnUnmount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Register a field
      const fieldConfig = {
        name: "testField",
        label: "Test Field",
        type: FormItemType.TEXT,
      };
      contextValue.register("testField", fieldConfig, mockSetState);

      expect(contextValue.registry["testField"]).toBeDefined();

      // Unmount the component
      unmount();

      // Check that unregister was called
      expect(mockOnUnmount).toHaveBeenCalled();
    });

    it("6. onChange of a field should run runOnChangeConditions and update dependent field", async () => {
      const formConfigWithConditions: FormConfig = {
        fields: [
          {
            name: "triggerField",
            label: "Trigger Field",
            type: FormItemType.TEXT,
          },
          {
            name: "dependentField",
            label: "Dependent Field",
            type: FormItemType.TEXT,
            onConditionMatch: [
              {
                if: {
                  properties: {
                    triggerField: { const: "show" },
                  },
                },
                then: {
                  dependentField: {
                    visible: true,
                    required: true,
                  },
                },
              },
            ],
          },
        ],
      };

      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={formConfigWithConditions}
          onMount={mockOnMount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Register both fields
      const triggerConfig = formConfigWithConditions.fields![0];
      const dependentConfig = formConfigWithConditions.fields![1];

      contextValue.register("triggerField", triggerConfig, mockSetState);
      contextValue.register("dependentField", dependentConfig, mockSetState);

      // Simulate onChange on trigger field
      contextValue.onChange("triggerField", "show", {
        triggerField: "show",
        dependentField: "",
      });

      // Wait for debounced execution
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Check that setState was called on dependent field with merged config
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          visible: true,
          required: true,
        })
      );
    });

    it("7. Multiple conditions should be merged and applied together", async () => {
      const formConfigWithMultipleConditions: FormConfig = {
        fields: [
          {
            name: "triggerField1",
            label: "Trigger Field 1",
            type: FormItemType.TEXT,
          },
          {
            name: "triggerField2",
            label: "Trigger Field 2",
            type: FormItemType.TEXT,
          },
          {
            name: "dependentField",
            label: "Dependent Field",
            type: FormItemType.TEXT,
            onConditionMatch: [
              {
                if: {
                  properties: {
                    triggerField1: { const: "value1" },
                  },
                },
                then: {
                  dependentField: {
                    visible: true,
                    required: true,
                  },
                },
              },
              {
                if: {
                  properties: {
                    triggerField2: { const: "value2" },
                  },
                },
                then: {
                  dependentField: {
                    visible: true,
                    required: true,
                  },
                },
              },
            ],
          },
        ],
      };

      const mockOnMount = jest.fn();

      render(
        <TestRegistryComponent
          formConfig={formConfigWithMultipleConditions}
          onMount={mockOnMount}
        />
      );

      const contextValue = mockOnMount.mock.calls[0][0];

      // Register all fields
      formConfigWithMultipleConditions.fields!.forEach((field) => {
        contextValue.register(field.name, field, mockSetState);
      });

      // Simulate onChange on both trigger fields
      contextValue.onChange("triggerField1", "value1", {
        triggerField1: "value1",
        triggerField2: "value2",
        dependentField: "",
      });

      // Wait for debounced execution
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Clear previous calls and trigger second field
      mockSetState.mockClear();

      contextValue.onChange("triggerField2", "value2", {
        triggerField1: "value1",
        triggerField2: "value2",
        dependentField: "",
      });

      // Wait for debounced execution
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Also expect the registry ref for the depdenent field to be updated with the merged values
      expect(contextValue.registry["dependentField"].config).toEqual(
        expect.objectContaining({
          visible: true,
          required: true,
        })
      );
      // Check that setState was called with merged values
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          visible: true,
          required: true,
        })
      );
    });
  });
});
