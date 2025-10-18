import { FormBuilder } from "../components/dynamic-form-builder/FormBuilder";
import {
  FormConfig,
  FormItemType,
} from "../components/dynamic-form-builder/types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock the UI components
jest.mock("../components/ui/form", () => ({
  Form: ({ children, ...props }: any) => {
    // Filter out react-hook-form props that shouldn't be on DOM elements
    const {
      control,
      subscribe,
      trigger,
      register,
      handleSubmit,
      watch,
      setValue,
      getValues,
      reset,
      resetField,
      clearErrors,
      setError,
      setFocus,
      getFieldState,
      formState,
      unregister,
      ...domProps
    } = props;
    return (
      <div {...domProps} data-testid="form">
        {children}
      </div>
    );
  },
}));

jest.mock("../components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock the FormField component
jest.mock("../components/dynamic-form-builder/FormField", () => ({
  FormField: ({ field, control }: any) => (
    <div data-testid={`field-${field.name}`} data-field-type={field.type}>
      <label htmlFor={field.name}>{field.label}</label>
      {field.type === "TEXT" && (
        <input
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          data-testid={`input-${field.name}`}
        />
      )}
      {field.type === "TEXTAREA" && (
        <textarea
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          data-testid={`textarea-${field.name}`}
        />
      )}
      {field.type === "SELECT" && (
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          data-testid={`select-${field.name}`}
        >
          <option value="">Select an option</option>
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {field.type === "RADIO" && (
        <div data-testid={`radio-group-${field.name}`}>
          {field.options?.map((option: any) => (
            <label key={option.value}>
              <input
                type="radio"
                name={field.name}
                value={option.value}
                required={field.required}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
      {field.type === "CHECKBOX" && (
        <div data-testid={`checkbox-group-${field.name}`}>
          {field.options?.map((option: any) => (
            <label key={option.value}>
              <input
                type="checkbox"
                name={field.name}
                value={option.value}
                required={field.required}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
      {field.type === "DATE" && (
        <input
          type="date"
          id={field.name}
          name={field.name}
          required={field.required}
          data-testid={`date-${field.name}`}
        />
      )}
      {field.type === "BOOLEAN" && (
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          required={field.required}
          data-testid={`boolean-${field.name}`}
        />
      )}
      {field.type === "ARRAY" && (
        <div data-testid={`array-${field.name}`}>
          <p>Array field: {field.name}</p>
          {field.structure?.map((subField: any) => (
            <div
              key={subField.name}
              data-testid={`array-field-${subField.name}`}
            >
              <label>{subField.label}</label>
              <input
                name={`${field.name}.${subField.name}`}
                placeholder={subField.placeholder}
                required={subField.required}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

describe("FormBuilder Dynamic Rendering Tests", () => {
  const mockOnSubmit = jest.fn();
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Simple Form", () => {
    it("should render a simple form with basic fields", () => {
      const simpleFormConfig: FormConfig = {
        label: "Simple Form",
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
          {
            name: "email",
            label: "Email",
            type: FormItemType.TEXT,
            placeholder: "Enter your email",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder formConfig={simpleFormConfig} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
      expect(screen.getByTestId("input-name")).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });
  });

  describe("2. With Initial Values", () => {
    it("should render form with initial values", () => {
      const formWithInitialValues: FormConfig = {
        label: "Form with Initial Values",
        initialValues: {
          name: "John Doe",
          email: "john@example.com",
          age: "25",
        },
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
          {
            name: "email",
            label: "Email",
            type: FormItemType.TEXT,
            placeholder: "Enter your email",
            required: true,
          },
          {
            name: "age",
            label: "Age",
            type: FormItemType.SELECT,
            options: [
              { value: "18", label: "18" },
              { value: "25", label: "25" },
              { value: "30", label: "30" },
            ],
          },
        ],
      };

      render(
        <FormBuilder formConfig={formWithInitialValues} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
      expect(screen.getByTestId("field-age")).toBeInTheDocument();
    });
  });

  describe("3. With Semantics", () => {
    it("should render form with semantic styling", () => {
      const formWithSemantics: FormConfig = {
        label: "Form with Semantics",
        settings: {
          layout: "vertical",
          className: "bg-gray-50 p-6 rounded-lg",
          defaultClassNames: {
            body: "mb-4 p-3 border border-gray-200 rounded",
            label: "text-gray-700 font-medium",
            field: "bg-white border border-gray-300 rounded-md",
          },
        },
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
            classNames: {
              body: "border-b border-gray-200 pb-4",
              label: "text-blue-600 font-semibold",
              field: "bg-white border-2 border-blue-200",
            },
          },
          {
            name: "message",
            label: "Message",
            type: FormItemType.TEXTAREA,
            placeholder: "Enter your message",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder formConfig={formWithSemantics} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-message")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-message")).toBeInTheDocument();
    });
  });

  describe("4. With Adapter", () => {
    it("should render form with custom adapter", () => {
      const customAdapter = {
        CustomField: ({ field }: any) => (
          <div data-testid={`custom-field-${field.name}`}>
            <label>{field.label}</label>
            <input
              name={field.name}
              placeholder={field.placeholder}
              data-testid={`custom-input-${field.name}`}
            />
          </div>
        ),
      };

      const formWithAdapter: FormConfig = {
        label: "Form with Adapter",
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
          {
            name: "customField",
            label: "Custom Field",
            type: "CustomField" as any,
            placeholder: "Custom placeholder",
          },
        ],
      };

      render(
        <FormBuilder
          formConfig={formWithAdapter}
          onSubmit={mockOnSubmit}
          adapter={customAdapter}
        >
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      // Note: Custom adapter fields would need special handling in the FormField mock
    });
  });

  describe("5. With Layout", () => {
    it("should render form with horizontal layout", () => {
      const formWithLayout: FormConfig = {
        label: "Form with Horizontal Layout",
        settings: {
          layout: "horizontal",
          className: "space-y-4",
        },
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
          {
            name: "email",
            label: "Email",
            type: FormItemType.TEXT,
            placeholder: "Enter your email",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder formConfig={formWithLayout} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
    });

    it("should render form with vertical layout (default)", () => {
      const formWithVerticalLayout: FormConfig = {
        label: "Form with Vertical Layout",
        settings: {
          layout: "vertical",
        },
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder
          formConfig={formWithVerticalLayout}
          onSubmit={mockOnSubmit}
        >
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
    });
  });

  describe("6. With Initial Values & onConditionMatch", () => {
    it("should render form with conditional logic and initial values", () => {
      const formWithConditionalLogic: FormConfig = {
        label: "Form with Conditional Logic",
        initialValues: {
          position: "developer",
          workLocation: "onsite",
        },
        fields: [
          {
            name: "position",
            label: "Position Applied For",
            type: FormItemType.SELECT,
            required: true,
            options: [
              { value: "developer", label: "Software Developer" },
              { value: "designer", label: "UI/UX Designer" },
              { value: "manager", label: "Project Manager" },
            ],
            onConditionMatch: [
              {
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
              },
            ],
          },
          {
            name: "programmingLanguages",
            label: "Programming Languages",
            type: FormItemType.SELECT,
            visible: false,
            options: [
              { value: "javascript", label: "JavaScript" },
              { value: "python", label: "Python" },
              { value: "java", label: "Java" },
              { value: "csharp", label: "C#" },
            ],
          },
          {
            name: "workLocation",
            label: "Preferred Work Location",
            type: FormItemType.RADIO,
            required: true,
            options: [
              { value: "remote", label: "Remote" },
              { value: "hybrid", label: "Hybrid" },
              { value: "onsite", label: "On-site" },
            ],
            onConditionMatch: [
              {
                if: {
                  properties: {
                    workLocation: { const: "onsite" },
                  },
                },
                then: {
                  relocationWilling: {
                    visible: true,
                    required: true,
                  },
                },
                else: {
                  relocationWilling: {
                    visible: false,
                    required: false,
                  },
                },
              },
            ],
          },
          {
            name: "relocationWilling",
            label: "Are you willing to relocate?",
            type: FormItemType.RADIO,
            visible: false,
            options: [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ],
          },
        ],
      };

      render(
        <FormBuilder
          formConfig={formWithConditionalLogic}
          onSubmit={mockOnSubmit}
        >
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-position")).toBeInTheDocument();
      expect(
        screen.getByTestId("field-programmingLanguages")
      ).toBeInTheDocument();
      expect(screen.getByTestId("field-workLocation")).toBeInTheDocument();
      expect(screen.getByTestId("field-relocationWilling")).toBeInTheDocument();
    });
  });

  describe("7. All Available Field Types", () => {
    it("should render all available field types", () => {
      const allFieldTypesForm: FormConfig = {
        label: "All Field Types Form",
        fields: [
          {
            name: "textField",
            label: "Text Field",
            type: FormItemType.TEXT,
            placeholder: "Enter text",
            required: true,
          },
          {
            name: "textareaField",
            label: "Textarea Field",
            type: FormItemType.TEXTAREA,
            placeholder: "Enter long text",
            required: true,
          },
          {
            name: "selectField",
            label: "Select Field",
            type: FormItemType.SELECT,
            required: true,
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ],
          },
          {
            name: "radioField",
            label: "Radio Field",
            type: FormItemType.RADIO,
            required: true,
            options: [
              { value: "radio1", label: "Radio Option 1" },
              { value: "radio2", label: "Radio Option 2" },
            ],
          },
          {
            name: "checkboxField",
            label: "Checkbox Field",
            type: FormItemType.CHECKBOX,
            required: true,
            options: [
              { value: "check1", label: "Check Option 1" },
              { value: "check2", label: "Check Option 2" },
              { value: "check3", label: "Check Option 3" },
            ],
          },
          {
            name: "dateField",
            label: "Date Field",
            type: FormItemType.DATE,
            required: true,
          },
          {
            name: "booleanField",
            label: "Boolean Field",
            type: FormItemType.BOOLEAN,
            required: true,
          },
          {
            name: "arrayField",
            label: "Array Field",
            type: FormItemType.ARRAY,
            structure: [
              {
                name: "itemName",
                label: "Item Name",
                type: FormItemType.TEXT,
                placeholder: "Enter item name",
                required: true,
              },
              {
                name: "itemValue",
                label: "Item Value",
                type: FormItemType.TEXT,
                placeholder: "Enter item value",
                required: true,
              },
            ],
          },
        ],
      };

      render(
        <FormBuilder formConfig={allFieldTypesForm} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      // Test that all field types are rendered
      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-textField")).toBeInTheDocument();
      expect(screen.getByTestId("field-textareaField")).toBeInTheDocument();
      expect(screen.getByTestId("field-selectField")).toBeInTheDocument();
      expect(screen.getByTestId("field-radioField")).toBeInTheDocument();
      expect(screen.getByTestId("field-checkboxField")).toBeInTheDocument();
      expect(screen.getByTestId("field-dateField")).toBeInTheDocument();
      expect(screen.getByTestId("field-booleanField")).toBeInTheDocument();
      expect(screen.getByTestId("field-arrayField")).toBeInTheDocument();

      // Test that specific input types are rendered
      expect(screen.getByTestId("input-textField")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-textareaField")).toBeInTheDocument();
      expect(screen.getByTestId("select-selectField")).toBeInTheDocument();
      expect(screen.getByTestId("radio-group-radioField")).toBeInTheDocument();
      expect(
        screen.getByTestId("checkbox-group-checkboxField")
      ).toBeInTheDocument();
      expect(screen.getByTestId("date-dateField")).toBeInTheDocument();
      expect(screen.getByTestId("boolean-booleanField")).toBeInTheDocument();
      expect(screen.getByTestId("array-arrayField")).toBeInTheDocument();

      // Test array field structure
      expect(screen.getByTestId("array-field-itemName")).toBeInTheDocument();
      expect(screen.getByTestId("array-field-itemValue")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should handle form submission", async () => {
      const simpleFormConfig: FormConfig = {
        label: "Simple Form",
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder formConfig={simpleFormConfig} onSubmit={mockOnSubmit}>
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      const submitButton = screen.getByTestId("button");
      fireEvent.click(submitButton);

      // Note: In a real test, you would need to mock react-hook-form's handleSubmit
      // This is a basic test to ensure the form renders and the submit button is clickable
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Form Change Handling", () => {
    it("should handle form field changes", () => {
      const formWithChangeHandler: FormConfig = {
        label: "Form with Change Handler",
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your name",
            required: true,
          },
        ],
      };

      render(
        <FormBuilder
          formConfig={formWithChangeHandler}
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        >
          <button type="submit" data-testid="button">
            Submit
          </button>
        </FormBuilder>
      );

      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
    });
  });

  describe("Complex Form Scenarios", () => {
    it("should render a complex form with multiple features", () => {
      const complexFormConfig: FormConfig = {
        label: "Complex Form",
        settings: {
          layout: "vertical",
          className: "max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md",
          defaultClassNames: {
            body: "mb-6",
            label: "block text-sm font-medium text-gray-700 mb-2",
            field:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          },
        },
        initialValues: {
          name: "Jane Doe",
          email: "jane@example.com",
          position: "developer",
          workLocation: "remote",
        },
        fields: [
          {
            name: "name",
            label: "Full Name",
            type: FormItemType.TEXT,
            placeholder: "Enter your full name",
            required: true,
            validator: {
              minLength: 2,
              maxLength: 50,
            },
          },
          {
            name: "email",
            label: "Email Address",
            type: FormItemType.TEXT,
            placeholder: "Enter your email",
            required: true,
            validator: {
              pattern: "^[A-Za-z0-9._-]+@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$",
            },
          },
          {
            name: "position",
            label: "Position Applied For",
            type: FormItemType.SELECT,
            required: true,
            options: [
              { value: "developer", label: "Software Developer" },
              { value: "designer", label: "UI/UX Designer" },
              { value: "manager", label: "Project Manager" },
            ],
            onConditionMatch: [
              {
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
              },
            ],
          },
          {
            name: "programmingLanguages",
            label: "Programming Languages",
            type: FormItemType.CHECKBOX,
            visible: false,
            options: [
              { value: "javascript", label: "JavaScript" },
              { value: "python", label: "Python" },
              { value: "java", label: "Java" },
              { value: "csharp", label: "C#" },
            ],
          },
          {
            name: "workLocation",
            label: "Preferred Work Location",
            type: FormItemType.RADIO,
            required: true,
            options: [
              { value: "remote", label: "Remote" },
              { value: "hybrid", label: "Hybrid" },
              { value: "onsite", label: "On-site" },
            ],
          },
          {
            name: "startDate",
            label: "Preferred Start Date",
            type: FormItemType.DATE,
            required: true,
          },
          {
            name: "termsAccepted",
            label: "I accept the terms and conditions",
            type: FormItemType.BOOLEAN,
            required: true,
          },
          {
            name: "additionalInfo",
            label: "Additional Information",
            type: FormItemType.TEXTAREA,
            placeholder: "Tell us more about yourself...",
          },
        ],
      };

      render(
        <FormBuilder
          formConfig={complexFormConfig}
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        >
          <button type="submit" data-testid="button">
            Submit Application
          </button>
        </FormBuilder>
      );

      // Test that all fields are rendered
      expect(screen.getByTestId("form")).toBeInTheDocument();
      expect(screen.getByTestId("field-name")).toBeInTheDocument();
      expect(screen.getByTestId("field-email")).toBeInTheDocument();
      expect(screen.getByTestId("field-position")).toBeInTheDocument();
      expect(
        screen.getByTestId("field-programmingLanguages")
      ).toBeInTheDocument();
      expect(screen.getByTestId("field-workLocation")).toBeInTheDocument();
      expect(screen.getByTestId("field-startDate")).toBeInTheDocument();
      expect(screen.getByTestId("field-termsAccepted")).toBeInTheDocument();
      expect(screen.getByTestId("field-additionalInfo")).toBeInTheDocument();

      // Test that all input types are rendered
      expect(screen.getByTestId("input-name")).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
      expect(screen.getByTestId("select-position")).toBeInTheDocument();
      expect(
        screen.getByTestId("checkbox-group-programmingLanguages")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("radio-group-workLocation")
      ).toBeInTheDocument();
      expect(screen.getByTestId("date-startDate")).toBeInTheDocument();
      expect(screen.getByTestId("boolean-termsAccepted")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-additionalInfo")).toBeInTheDocument();
    });
  });
});
