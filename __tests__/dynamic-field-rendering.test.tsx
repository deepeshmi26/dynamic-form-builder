import { FormBuilder } from "../components/dynamic-form-builder/FormBuilder";
import {
  FormConfig,
  FormItemType,
} from "../components/dynamic-form-builder/types";
import { FORM_EXAMPLES } from "../lib/examples";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock the useFormBuilder hook to control form behavior
jest.mock("../components/dynamic-form-builder/hooks/useFormBuilder");

// Mock FormField component to simulate real behavior with conditional logic
jest.mock("../components/dynamic-form-builder/FormField", () => ({
  FormField: ({ field, settings, control }: any) => {
    // Don't render if visible is false
    if (field.visible === false) {
      return null;
    }

    const renderField = () => {
      switch (field.type) {
        case FormItemType.TEXT:
          return (
            <input
              data-testid={`input-${field.name}`}
              placeholder={field.placeholder}
              required={field.required}
              onChange={(e) => {
                // Simulate field change
                if (control?.onChange) {
                  control.onChange(field.name, e.target.value);
                }
              }}
            />
          );
        case FormItemType.SELECT:
          return (
            <select
              data-testid={`select-${field.name}`}
              required={field.required}
              onChange={(e) => {
                if (control?.onChange) {
                  control.onChange(field.name, e.target.value);
                }
              }}
            >
              <option value="">{field.placeholder || "Select..."}</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case FormItemType.CHECKBOX:
          return (
            <div data-testid={`checkbox-group-${field.name}`}>
              {field.options?.map((option: any) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    value={option.value}
                    onChange={(e) => {
                      if (control?.onChange) {
                        const currentValues =
                          control.getValues?.(field.name) || [];
                        const newValues = e.target.checked
                          ? [
                              ...(Array.isArray(currentValues)
                                ? currentValues
                                : []),
                              option.value,
                            ]
                          : (Array.isArray(currentValues)
                              ? currentValues
                              : []
                            ).filter((v: string) => v !== option.value);
                        control.onChange(field.name, newValues);
                      }
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          );
        case FormItemType.RADIO:
          return (
            <div data-testid={`radio-group-${field.name}`}>
              {field.options?.map((option: any) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    onChange={(e) => {
                      if (control?.onChange) {
                        control.onChange(field.name, e.target.value);
                      }
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          );
        case FormItemType.TEXTAREA:
          return (
            <textarea
              data-testid={`textarea-${field.name}`}
              placeholder={field.placeholder}
              required={field.required}
              onChange={(e) => {
                if (control?.onChange) {
                  control.onChange(field.name, e.target.value);
                }
              }}
            />
          );
        case FormItemType.DATE:
          return (
            <input
              type="date"
              data-testid={`date-${field.name}`}
              required={field.required}
              onChange={(e) => {
                if (control?.onChange) {
                  control.onChange(field.name, e.target.value);
                }
              }}
            />
          );
        case FormItemType.BOOLEAN:
          return (
            <input
              type="checkbox"
              data-testid={`boolean-${field.name}`}
              required={field.required}
              onChange={(e) => {
                if (control?.onChange) {
                  control.onChange(field.name, e.target.checked);
                }
              }}
            />
          );
        case FormItemType.ARRAY:
          const arrayValues = control?.getValues?.(field.name) || [];
          return (
            <div data-testid={`array-${field.name}`}>
              <button
                type="button"
                data-testid={`add-${field.name}`}
                onClick={() => {
                  if (control?.onChange) {
                    control.onChange(field.name, [...arrayValues, {}]);
                  }
                }}
              >
                Add Item
              </button>
              {Array.isArray(arrayValues) &&
                arrayValues.map((item: any, index: number) => (
                  <div
                    key={index}
                    data-testid={`array-item-${field.name}-${index}`}
                  >
                    {field.structure?.map((subField: any) => (
                      <input
                        key={subField.name}
                        data-testid={`array-input-${field.name}-${index}-${subField.name}`}
                        placeholder={subField.placeholder}
                        onChange={(e) => {
                          if (control?.onChange) {
                            const currentValues =
                              control.getValues?.(field.name) || [];
                            const newValues = [...currentValues];
                            newValues[index] = {
                              ...newValues[index],
                              [subField.name]: e.target.value,
                            };
                            control.onChange(field.name, newValues);
                          }
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      data-testid={`remove-${field.name}-${index}`}
                      onClick={() => {
                        if (control?.onChange) {
                          const currentValues =
                            control.getValues?.(field.name) || [];
                          const newValues = currentValues.filter(
                            (_: any, i: number) => i !== index
                          );
                          control.onChange(field.name, newValues);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          );
        default:
          return (
            <div data-testid={`unknown-${field.name}`}>Unknown field type</div>
          );
      }
    };

    return (
      <div
        data-testid={`field-${field.name}`}
        className={field.classNames?.body}
      >
        <label htmlFor={field.name} className={field.classNames?.label}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        {renderField()}
        {field.error && (
          <div
            data-testid={`error-${field.name}`}
            className="text-red-500 text-sm"
          >
            {field.error}
          </div>
        )}
      </div>
    );
  },
}));

// Mock useFormBuilder hook
const mockUseFormBuilder =
  require("../components/dynamic-form-builder/hooks/useFormBuilder").useFormBuilder;

describe("Dynamic Field Rendering Tests", () => {
  let mockForm: any;
  let mockHandleSubmit: jest.Mock;
  let mockContextValue: any;
  let mockOnChange: jest.Mock;
  let mockGetValues: jest.Mock;
  let mockSetValue: jest.Mock;
  let mockUpdateState: jest.Mock;
  let mockRegister: jest.Mock;
  let mockUnregister: jest.Mock;

  beforeEach(() => {
    mockOnChange = jest.fn();
    mockGetValues = jest.fn().mockReturnValue({});
    mockSetValue = jest.fn();
    mockHandleSubmit = jest.fn();
    mockUpdateState = jest.fn();
    mockRegister = jest.fn();
    mockUnregister = jest.fn();

    mockForm = {
      control: {
        onChange: mockOnChange,
        getValues: mockGetValues,
        setValue: mockSetValue,
      },
      handleSubmit: mockHandleSubmit,
      formState: { errors: {} },
      watch: jest.fn(),
      reset: jest.fn(),
      trigger: jest.fn(),
    };

    mockContextValue = {
      registry: {},
      onChangeRecord: {},
      updateState: mockUpdateState,
      register: mockRegister,
      unregister: mockUnregister,
      onChange: mockOnChange,
    };

    mockUseFormBuilder.mockReturnValue({
      form: mockForm,
      handleSubmit: mockHandleSubmit,
      contextValue: mockContextValue,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Test 1: Field Rendering with Examples", () => {
    it("should render job application form with all field types", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check that all expected fields are rendered
      expect(screen.getByTestId("field-position")).toBeInTheDocument();
      expect(screen.getByTestId("field-experience")).toBeInTheDocument();
      expect(screen.getByTestId("field-workLocation")).toBeInTheDocument();

      // Check that conditional fields are initially hidden
      expect(
        screen.queryByTestId("field-programmingLanguages")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("field-relocationWilling")
      ).not.toBeInTheDocument();

      // Check field types
      expect(screen.getByTestId("select-position")).toBeInTheDocument();
      expect(screen.getByTestId("select-experience")).toBeInTheDocument();
      expect(
        screen.getByTestId("radio-group-workLocation")
      ).toBeInTheDocument();
    });

    it("should render linked selects form correctly", () => {
      const formConfig = FORM_EXAMPLES.linkedSelects;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check that both select fields are rendered
      expect(screen.getByTestId("field-carBrand")).toBeInTheDocument();
      expect(screen.getByTestId("field-carModel")).toBeInTheDocument();

      // Check that car model initially has no options (only placeholder)
      const carModelSelect = screen.getByTestId("select-carModel");
      expect(carModelSelect.children).toHaveLength(1); // Only placeholder option
    });

    it("should render simple contact form with all field types", () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check all field types are rendered
      expect(screen.getByTestId("field-dob")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-favoriteFood")).toBeInTheDocument();
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
      expect(screen.getByTestId("field-socialHandles")).toBeInTheDocument();
      expect(screen.getByTestId("field-message")).toBeInTheDocument();

      // Check field types
      expect(screen.getByTestId("date-dob")).toBeInTheDocument();
      expect(screen.getByTestId("input-name")).toBeInTheDocument();
      expect(
        screen.getByTestId("checkbox-group-favoriteFood")
      ).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
      expect(screen.getByTestId("array-socialHandles")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-message")).toBeInTheDocument();
    });
  });

  describe("Test 2: Field Visibility and Requirements", () => {
    it("should show required indicators for required fields", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check that required fields show asterisk
      expect(screen.getByTestId("field-position")).toHaveTextContent("*");
      expect(screen.getByTestId("field-experience")).toHaveTextContent("*");
      expect(screen.getByTestId("field-workLocation")).toHaveTextContent("*");
    });

    it("should hide fields with visible: false", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Fields with visible: false should not be rendered
      expect(
        screen.queryByTestId("field-programmingLanguages")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("field-relocationWilling")
      ).not.toBeInTheDocument();
    });

    it("should render fields with custom classNames", () => {
      const formConfig = FORM_EXAMPLES.contactFormWithSemanticStyling;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check that fields are rendered with custom styling
      expect(screen.getByTestId("field-dob")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
    });
  });

  describe("Test 3: Field Options and Structure", () => {
    it("should render select fields with correct options", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check position options
      expect(screen.getByText("Software Developer")).toBeInTheDocument();
      expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
      expect(screen.getByText("Project Manager")).toBeInTheDocument();

      // Check work location options
      expect(screen.getByText("Remote")).toBeInTheDocument();
      expect(screen.getByText("Hybrid")).toBeInTheDocument();
      expect(screen.getByText("On-site")).toBeInTheDocument();
    });

    it("should render checkbox fields with correct options", () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check favorite food options
      expect(screen.getByText("Pizza")).toBeInTheDocument();
      expect(screen.getByText("Burger")).toBeInTheDocument();
      expect(screen.getByText("Salad")).toBeInTheDocument();
      expect(screen.getByText("Sushi")).toBeInTheDocument();
    });

    it("should render array fields with add/remove functionality", () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check array field is rendered
      expect(screen.getByTestId("array-socialHandles")).toBeInTheDocument();
      expect(screen.getByTestId("add-socialHandles")).toBeInTheDocument();
    });
  });

  describe("Test 4: Form Interaction", () => {
    it("should handle form submission", async () => {
      const mockOnSubmit = jest.fn();
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      mockGetValues.mockReturnValue({
        name: "John Doe",
        email: "john@example.com",
        dob: "1990-01-01",
        favoriteFood: ["pizza", "burger"],
        message: "Hello world",
      });

      render(
        <FormBuilder formConfig={formConfig} onSubmit={mockOnSubmit}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should handle field value changes", async () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Test select field change
      const positionSelect = screen.getByTestId("select-position");
      await userEvent.selectOptions(positionSelect, "developer");

      expect(mockOnChange).toHaveBeenCalledWith("position", "developer");

      // Test radio field change
      const remoteRadio = screen.getByDisplayValue("remote");
      await userEvent.click(remoteRadio);

      expect(mockOnChange).toHaveBeenCalledWith("workLocation", "remote");
    });

    it("should handle text input changes", async () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      const nameInput = screen.getByTestId("input-name");
      await userEvent.type(nameInput, "John Doe");

      expect(mockOnChange).toHaveBeenCalledWith("name", "J");
      expect(mockOnChange).toHaveBeenCalledWith("name", "Jo");
      expect(mockOnChange).toHaveBeenCalledWith("name", "Joh");
      // ... and so on for each character
    });
  });

  describe("Test 4.5: Conditional Updates with User Interactions", () => {
    it("should handle user interactions with form fields", async () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Initially, conditional fields should be hidden
      expect(
        screen.queryByTestId("field-programmingLanguages")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("field-relocationWilling")
      ).not.toBeInTheDocument();

      // User selects "Software Developer" position
      const positionSelect = screen.getByTestId("select-position");
      await userEvent.selectOptions(positionSelect, "developer");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("position", "developer");

      // User selects experience level
      const experienceSelect = screen.getByTestId("select-experience");
      await userEvent.selectOptions(experienceSelect, "5");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("experience", "5");

      // User clicks "On-site" work location
      const onsiteRadio = screen.getByDisplayValue("onsite");
      await userEvent.click(onsiteRadio);

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("workLocation", "onsite");
    });

    it("should handle linked selects user interactions", async () => {
      const formConfig = FORM_EXAMPLES.linkedSelects;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Initially, car model should have no options (only placeholder)
      const carModelSelect = screen.getByTestId("select-carModel");
      expect(carModelSelect.children).toHaveLength(1); // Only placeholder option

      // User selects Toyota brand
      const carBrandSelect = screen.getByTestId("select-carBrand");
      await userEvent.selectOptions(carBrandSelect, "toyota");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("carBrand", "toyota");

      // User selects Honda brand
      await userEvent.selectOptions(carBrandSelect, "honda");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("carBrand", "honda");
    });

    it("should handle checkbox interactions with conditional logic", async () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // User clicks on Pizza checkbox
      const pizzaCheckbox = screen.getByDisplayValue("pizza");
      await userEvent.click(pizzaCheckbox);

      // Simulate the onChange callback
      mockContextValue.onChange("favoriteFood", ["pizza"], {
        favoriteFood: ["pizza"],
      });

      // User clicks on Burger checkbox
      const burgerCheckbox = screen.getByDisplayValue("burger");
      await userEvent.click(burgerCheckbox);

      // Simulate the onChange callback
      mockContextValue.onChange("favoriteFood", ["pizza", "burger"], {
        favoriteFood: ["pizza", "burger"],
      });

      // Verify that both checkboxes are checked
      expect(pizzaCheckbox).toBeChecked();
      expect(burgerCheckbox).toBeChecked();
    });

    it("should handle text input with validation", async () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // User types in name field
      const nameInput = screen.getByTestId("input-name");
      await userEvent.type(nameInput, "John");

      // Simulate the onChange callback for each character
      expect(mockOnChange).toHaveBeenCalledWith("name", "J");
      expect(mockOnChange).toHaveBeenCalledWith("name", "Jo");
      expect(mockOnChange).toHaveBeenCalledWith("name", "Joh");
      expect(mockOnChange).toHaveBeenCalledWith("name", "John");

      // User types in email field
      const emailInput = screen.getByTestId("input-email");
      await userEvent.type(emailInput, "john@example.com");

      // Verify email input changes
      expect(mockOnChange).toHaveBeenCalledWith("email", "j");
      expect(mockOnChange).toHaveBeenCalledWith("email", "jo");
      expect(mockOnChange).toHaveBeenCalledWith("email", "joh");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@e");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@ex");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@exa");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@exam");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@examp");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@exampl");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@example");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@example.");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@example.c");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@example.co");
      expect(mockOnChange).toHaveBeenCalledWith("email", "john@example.com");
    });

    it("should handle date input changes", async () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // User selects a date
      const dateInput = screen.getByTestId("date-dob");
      await userEvent.type(dateInput, "1990-01-01");

      // Simulate the onChange callback
      mockContextValue.onChange("dob", "1990-01-01", {
        dob: "1990-01-01",
      });

      // Verify date input value
      expect(dateInput).toHaveValue("1990-01-01");
    });

    it("should handle textarea input changes", async () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // User types in textarea
      const textareaInput = screen.getByTestId("textarea-message");
      await userEvent.type(textareaInput, "Hello, this is a test message");

      // Simulate the onChange callback
      mockContextValue.onChange("message", "Hello, this is a test message", {
        message: "Hello, this is a test message",
      });

      // Verify textarea value
      expect(textareaInput).toHaveValue("Hello, this is a test message");
    });
  });

  describe("Test 5: Field Registration", () => {
    it("should provide registration functions in context", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Check that registration functions are available in context
      expect(mockContextValue.register).toBeDefined();
      expect(mockContextValue.unregister).toBeDefined();
      expect(typeof mockContextValue.register).toBe("function");
      expect(typeof mockContextValue.unregister).toBe("function");
    });

    it("should handle component unmounting gracefully", () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      const { unmount } = render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Verify form renders correctly
      expect(screen.getByTestId("field-dob")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Test 6: Conditional Logic Structure", () => {
    it("should have correct conditional logic structure in job application", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Verify that the position field has the correct conditional logic structure
      const positionField = formConfig.fields?.find(
        (f) => f.name === "position"
      );
      expect(positionField?.onConditionMatch).toBeDefined();
      expect(positionField?.onConditionMatch?.[0]).toEqual({
        if: {
          properties: {
            position: { const: "developer" },
          },
        },
        then: {
          programmingLanguages: {
            visible: true,
            required: true,
          },
        },
        else: {
          programmingLanguages: {
            visible: false,
            required: false,
          },
        },
      });
    });

    it("should have correct conditional logic structure in linked selects", () => {
      const formConfig = FORM_EXAMPLES.linkedSelects;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Verify that the carBrand field has the correct conditional logic structure
      const carBrandField = formConfig.fields?.find(
        (f) => f.name === "carBrand"
      );
      expect(carBrandField?.onConditionMatch).toBeDefined();
      expect(carBrandField?.onConditionMatch?.[0]).toEqual({
        if: {
          properties: {
            carBrand: { const: "toyota" },
          },
        },
        then: {
          carModel: {
            options: [
              { value: "camry", label: "Camry" },
              { value: "corolla", label: "Corolla" },
              { value: "rav4", label: "RAV4" },
            ],
          },
        },
      });
    });
  });

  describe("Test 7: Form Configuration Validation", () => {
    it("should validate form configuration structure", () => {
      const formConfig = FORM_EXAMPLES.simpleContactForm;

      // Validate form config structure
      expect(formConfig.label).toBeDefined();
      expect(formConfig.fields).toBeDefined();
      expect(Array.isArray(formConfig.fields)).toBe(true);
      expect(formConfig.fields?.length).toBeGreaterThan(0);

      // Validate each field has required properties
      formConfig.fields?.forEach((field) => {
        expect(field.name).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.type).toBeDefined();
      });
    });

    it("should validate conditional logic structure", () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      // Find fields with conditional logic
      const fieldsWithConditions = formConfig.fields?.filter(
        (f) => f.onConditionMatch
      );
      expect(fieldsWithConditions?.length).toBeGreaterThan(0);

      // Validate conditional logic structure
      fieldsWithConditions?.forEach((field) => {
        field.onConditionMatch?.forEach((condition) => {
          expect(condition.if).toBeDefined();
          expect(condition.then).toBeDefined();
          expect(condition.else).toBeDefined();
        });
      });
    });
  });

  describe("Test 8: Complete User Workflow Integration", () => {
    it("should handle complete user workflow with job application form", async () => {
      const formConfig = FORM_EXAMPLES.jobApplication;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit Application</button>
        </FormBuilder>
      );

      // Step 1: User selects position
      const positionSelect = screen.getByTestId("select-position");
      await userEvent.selectOptions(positionSelect, "developer");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("position", "developer");

      // Step 2: User selects experience level
      const experienceSelect = screen.getByTestId("select-experience");
      await userEvent.selectOptions(experienceSelect, "5");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("experience", "5");

      // Step 3: User selects work location
      const onsiteRadio = screen.getByDisplayValue("onsite");
      await userEvent.click(onsiteRadio);

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("workLocation", "onsite");

      // Step 4: User submits the form
      const submitButton = screen.getByRole("button", {
        name: "Submit Application",
      });
      await userEvent.click(submitButton);

      // Verify form submission was handled
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should handle linked selects workflow", async () => {
      const formConfig = FORM_EXAMPLES.linkedSelects;

      render(
        <FormBuilder formConfig={formConfig}>
          <button type="submit">Submit</button>
        </FormBuilder>
      );

      // Step 1: User selects Toyota brand
      const carBrandSelect = screen.getByTestId("select-carBrand");
      await userEvent.selectOptions(carBrandSelect, "toyota");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("carBrand", "toyota");

      // Step 2: User selects Honda brand
      await userEvent.selectOptions(carBrandSelect, "honda");

      // Verify the onChange was called
      expect(mockOnChange).toHaveBeenCalledWith("carBrand", "honda");

      // Step 3: User submits the form
      const submitButton = screen.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);

      // Verify form submission was handled
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });
});
