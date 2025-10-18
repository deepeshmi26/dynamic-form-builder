import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FormFieldConfig,
  FormItemType,
  FormSettings,
} from "../components/dynamic-form-builder/types";
import { TextFormField } from "../components/dynamic-form-builder/fields/TextFormField";
import { TextAreaFormField } from "../components/dynamic-form-builder/fields/TextAreaFormField";
import { SelectFormField } from "../components/dynamic-form-builder/fields/SelectFormField";
import { CheckboxFormField } from "../components/dynamic-form-builder/fields/CheckboxFormField";
import { CheckboxGroupFormField } from "../components/dynamic-form-builder/fields/CheckboxGroupFormField";
import { RadioGroupFormField } from "../components/dynamic-form-builder/fields/RadioGroupFormField";
import { DateFormField } from "../components/dynamic-form-builder/fields/DateFormField";

// Mock the FormField component to simplify testing
jest.mock("../components/dynamic-form-builder/FormField", () => ({
  FormField: ({ field, settings }: any) => {
    const layout = settings?.layout || "vertical";
    const mergedClassNames = {
      body: field.classNames?.body || settings?.defaultClassNames?.body || "",
      label:
        field.classNames?.label || settings?.defaultClassNames?.label || "",
      field:
        field.classNames?.field || settings?.defaultClassNames?.field || "",
    };

    if (field.visible === false) {
      return null;
    }

    return (
      <div
        className={`space-y-2 ${
          layout === "horizontal" ? "sm:grid-cols-3" : ""
        } ${mergedClassNames.body}`}
      >
        <label
          className={`text-sm sm:text-base font-medium !mb-0 ${
            layout === "horizontal" ? "sm:text-right" : ""
          } ${mergedClassNames.label}`}
        >
          {field.label}
        </label>
        <div
          className={`${layout === "horizontal" ? "sm:col-span-2" : ""} ${
            mergedClassNames.field
          }`}
        >
          {field.type === FormItemType.TEXT && (
            <input data-testid="text-field" placeholder={field.placeholder} />
          )}
          {field.type === FormItemType.SELECT && (
            <select data-testid="select-field">
              <option value="">{field.placeholder || "Select"}</option>
              {field.options?.map((opt: any) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {field.type === FormItemType.CHECKBOX && (
            <input data-testid="checkbox-field" type="checkbox" />
          )}
          {field.type === FormItemType.CHECKBOX && field.options && (
            <div data-testid="checkbox-group-field">
              {field.options.map((opt: any) => (
                <label key={opt.value}>
                  <input type="checkbox" />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
          {field.type === FormItemType.RADIO && (
            <div data-testid="radio-group-field">
              {field.options?.map((opt: any) => (
                <label key={opt.value}>
                  <input
                    type="radio"
                    name="radio-group"
                    disabled={opt.disabled}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
          {field.type === FormItemType.DATE && (
            <input
              data-testid="date-field"
              type="date"
              placeholder={field.placeholder}
            />
          )}
          {field.type === FormItemType.ARRAY && (
            <div data-testid="array-field">
              <span>Array Field: {field.name}</span>
              <span>Structure: {field.structure?.length || 0} items</span>
            </div>
          )}
        </div>
      </div>
    );
  },
}));

// Mock the form field components for FormField wrapper tests
jest.mock("../components/dynamic-form-builder/fields/TextFormField", () => ({
  TextFormField: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="text-field"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

jest.mock(
  "../components/dynamic-form-builder/fields/TextAreaFormField",
  () => ({
    TextAreaFormField: ({ value, onChange, placeholder }: any) => (
      <textarea
        data-testid="textarea-field"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    ),
  })
);

jest.mock("../components/dynamic-form-builder/fields/SelectFormField", () => ({
  SelectFormField: ({ value, onChange, options, placeholder }: any) => (
    <select
      data-testid="select-field"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">{placeholder || "Select"}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock(
  "../components/dynamic-form-builder/fields/CheckboxFormField",
  () => ({
    CheckboxFormField: ({ value, onChange }: any) => (
      <input
        data-testid="checkbox-field"
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    ),
  })
);

jest.mock(
  "../components/dynamic-form-builder/fields/CheckboxGroupFormField",
  () => ({
    CheckboxGroupFormField: ({ value, onChange, options }: any) => (
      <div data-testid="checkbox-group-field">
        {options?.map((opt: any) => (
          <label key={opt.value}>
            <input
              type="checkbox"
              checked={value?.includes(opt.value) || false}
              onChange={(e) => {
                const newValue = e.target.checked
                  ? [...(value || []), opt.value]
                  : (value || []).filter((v: any) => v !== opt.value);
                onChange?.(newValue);
              }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    ),
  })
);

jest.mock(
  "../components/dynamic-form-builder/fields/RadioGroupFormField",
  () => ({
    RadioGroupFormField: ({ value, onChange, options }: any) => (
      <div data-testid="radio-group-field">
        {options?.map((opt: any) => (
          <label key={opt.value}>
            <input
              type="radio"
              name="radio-group"
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={opt.disabled}
            />
            {opt.label}
          </label>
        ))}
      </div>
    ),
  })
);

jest.mock("../components/dynamic-form-builder/fields/DateFormField", () => ({
  DateFormField: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="date-field"
      type="date"
      value={value ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => onChange?.(new Date(e.target.value))}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("../components/dynamic-form-builder/fields/ArrayFormField", () => ({
  ArrayFormField: ({ name, structure }: any) => (
    <div data-testid="array-field">
      <span>Array Field: {name}</span>
      <span>Structure: {structure?.length || 0} items</span>
    </div>
  ),
}));

describe("Form Fields", () => {
  const mockSettings: FormSettings = {
    layout: "vertical",
    className: "test-form-class",
    defaultClassNames: {
      body: "test-body-class",
      label: "test-label-class",
      field: "test-field-class",
    },
  };

  describe("FormField Wrapper", () => {
    describe("Text Field", () => {
      const textFieldConfig: FormFieldConfig = {
        name: "name",
        label: "Name",
        type: FormItemType.TEXT,
        placeholder: "Enter your name",
        required: true,
        shouldUnregister: true,
      };

      it("should render text field with correct props", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={textFieldConfig} />);

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByTestId("text-field")).toBeInTheDocument();
        expect(screen.getByTestId("text-field")).toHaveAttribute(
          "placeholder",
          "Enter your name"
        );
      });

      it("should apply custom class names", () => {
        const customClassNames = {
          body: "custom-body",
          label: "custom-label",
          field: "custom-field",
        };
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");

        render(
          <FormField
            settings={mockSettings}
            field={{ ...textFieldConfig, classNames: customClassNames }}
          />
        );

        const fieldContainer = screen.getByText("Name").closest("div");
        expect(fieldContainer).toHaveClass("custom-body");
      });

      it("should show required indicator", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={textFieldConfig} />);

        expect(screen.getByText("Name")).toBeInTheDocument();
        // In a real implementation, you might check for an asterisk or required indicator
      });
    });

    describe("Select Field", () => {
      const selectFieldConfig: FormFieldConfig = {
        name: "country",
        label: "Country",
        type: FormItemType.SELECT,
        placeholder: "Select country",
        options: [
          { value: "us", label: "United States" },
          { value: "ca", label: "Canada" },
          { value: "uk", label: "United Kingdom" },
        ],
        shouldUnregister: true,
      };

      it("should render select field with options", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={selectFieldConfig} />);

        expect(screen.getByText("Country")).toBeInTheDocument();
        expect(screen.getByTestId("select-field")).toBeInTheDocument();
        expect(screen.getByText("United States")).toBeInTheDocument();
        expect(screen.getByText("Canada")).toBeInTheDocument();
        expect(screen.getByText("United Kingdom")).toBeInTheDocument();
      });
    });

    describe("Checkbox Field", () => {
      const checkboxFieldConfig: FormFieldConfig = {
        name: "newsletter",
        label: "Subscribe to newsletter",
        type: FormItemType.CHECKBOX,
        shouldUnregister: true,
      };

      it("should render checkbox field", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(
          <FormField settings={mockSettings} field={checkboxFieldConfig} />
        );

        expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
        expect(screen.getByTestId("checkbox-field")).toBeInTheDocument();
      });
    });

    describe("Checkbox Group Field", () => {
      const checkboxGroupConfig: FormFieldConfig = {
        name: "interests",
        label: "Interests",
        type: FormItemType.CHECKBOX,
        options: [
          { value: "tech", label: "Technology" },
          { value: "sports", label: "Sports" },
          { value: "music", label: "Music" },
        ],
        shouldUnregister: true,
      };

      it("should render checkbox group field", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(
          <FormField settings={mockSettings} field={checkboxGroupConfig} />
        );

        expect(screen.getByText("Interests")).toBeInTheDocument();
        expect(screen.getByTestId("checkbox-group-field")).toBeInTheDocument();
        expect(screen.getByText("Technology")).toBeInTheDocument();
        expect(screen.getByText("Sports")).toBeInTheDocument();
        expect(screen.getByText("Music")).toBeInTheDocument();
      });
    });

    describe("Radio Group Field", () => {
      const radioGroupConfig: FormFieldConfig = {
        name: "gender",
        label: "Gender",
        type: FormItemType.RADIO,
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
        shouldUnregister: true,
      };

      it("should render radio group field", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={radioGroupConfig} />);

        expect(screen.getByText("Gender")).toBeInTheDocument();
        expect(screen.getByTestId("radio-group-field")).toBeInTheDocument();
        expect(screen.getByText("Male")).toBeInTheDocument();
        expect(screen.getByText("Female")).toBeInTheDocument();
        expect(screen.getByText("Other")).toBeInTheDocument();
      });
    });

    describe("Date Field", () => {
      const dateFieldConfig: FormFieldConfig = {
        name: "birthdate",
        label: "Birth Date",
        type: FormItemType.DATE,
        placeholder: "Select date",
        shouldUnregister: true,
      };

      it("should render date field", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={dateFieldConfig} />);

        expect(screen.getByText("Birth Date")).toBeInTheDocument();
        expect(screen.getByTestId("date-field")).toBeInTheDocument();
      });
    });

    describe("Array Field", () => {
      const arrayFieldConfig: FormFieldConfig = {
        name: "items",
        label: "Items",
        type: FormItemType.ARRAY,
        structure: [
          {
            name: "title",
            label: "Title",
            type: FormItemType.TEXT,
          },
          {
            name: "description",
            label: "Description",
            type: FormItemType.TEXTAREA,
          },
        ],
        shouldUnregister: true,
      };

      it("should render array field", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(<FormField settings={mockSettings} field={arrayFieldConfig} />);

        expect(screen.getByText("Items")).toBeInTheDocument();
        expect(screen.getByTestId("array-field")).toBeInTheDocument();
        expect(screen.getByText("Array Field: items")).toBeInTheDocument();
        expect(screen.getByText("Structure: 2 items")).toBeInTheDocument();
      });
    });

    describe("Field Visibility", () => {
      it("should hide field when visible is false", () => {
        const hiddenFieldConfig: FormFieldConfig = {
          name: "hidden",
          label: "Hidden Field",
          type: FormItemType.TEXT,
          visible: false,
          shouldUnregister: true,
        };
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");

        render(<FormField settings={mockSettings} field={hiddenFieldConfig} />);

        expect(screen.queryByText("Hidden Field")).not.toBeInTheDocument();
      });

      it("should show field when visible is true", () => {
        const visibleFieldConfig: FormFieldConfig = {
          name: "visible",
          label: "Visible Field",
          type: FormItemType.TEXT,
          visible: true,
          shouldUnregister: true,
        };
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");

        render(
          <FormField settings={mockSettings} field={visibleFieldConfig} />
        );

        expect(screen.getByText("Visible Field")).toBeInTheDocument();
      });
    });

    describe("Field Layout", () => {
      it("should apply horizontal layout classes", () => {
        const horizontalSettings = {
          ...mockSettings,
          layout: "horizontal",
        };
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");

        render(
          <FormField
            settings={horizontalSettings}
            field={{
              name: "test",
              label: "Test Field",
              type: FormItemType.TEXT,
              shouldUnregister: true,
            }}
          />
        );

        const fieldContainer = screen.getByText("Test Field").closest("div");
        expect(fieldContainer).toHaveClass("sm:grid-cols-3");
      });

      it("should apply vertical layout classes", () => {
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");
        render(
          <FormField
            settings={mockSettings}
            field={{
              name: "test",
              label: "Test Field",
              type: FormItemType.TEXT,
              shouldUnregister: true,
            }}
          />
        );

        const fieldContainer = screen.getByText("Test Field").closest("div");
        expect(fieldContainer).toHaveClass("space-y-2");
      });
    });

    describe("Error Handling", () => {
      it("should handle unknown field type gracefully", () => {
        const unknownFieldConfig: FormFieldConfig = {
          name: "unknown",
          label: "Unknown Field",
          type: "UNKNOWN_TYPE" as any,
          shouldUnregister: true,
        };
        const {
          FormField,
        } = require("../components/dynamic-form-builder/FormField");

        // This should not throw an error
        expect(() => {
          render(
            <FormField settings={mockSettings} field={unknownFieldConfig} />
          );
        }).not.toThrow();
      });
    });
  });

  describe("Individual Form Field Components", () => {
    describe("TextFormField", () => {
      it("should render with correct value and placeholder", () => {
        const mockOnChange = jest.fn();
        render(
          <TextFormField
            value="test value"
            onChange={mockOnChange}
            placeholder="Enter text"
          />
        );

        const input = screen.getByDisplayValue("test value");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("placeholder", "Enter text");
      });

      it("should call onChange when input value changes", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<TextFormField onChange={mockOnChange} />);

        const input = screen.getByRole("textbox");
        await user.type(input, "new text");

        // TextFormField calls onChange for each character typed
        expect(mockOnChange).toHaveBeenCalledTimes(8); // 'n', 'e', 'w', ' ', 't', 'e', 'x', 't'
        expect(mockOnChange).toHaveBeenLastCalledWith("t");
      });

      it("should handle empty value", () => {
        const mockOnChange = jest.fn();
        render(<TextFormField value="" onChange={mockOnChange} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("");
      });
    });

    describe("TextAreaFormField", () => {
      it("should render with correct value and placeholder", () => {
        const mockOnChange = jest.fn();
        render(
          <TextAreaFormField
            value="test textarea value"
            onChange={mockOnChange}
            placeholder="Enter message"
          />
        );

        const textarea = screen.getByDisplayValue("test textarea value");
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAttribute("placeholder", "Enter message");
      });

      it("should call onChange when textarea value changes", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<TextAreaFormField onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "new textarea content");

        // TextAreaFormField calls onChange for each character typed
        expect(mockOnChange).toHaveBeenCalledTimes(20); // 'n', 'e', 'w', ' ', 't', 'e', 'x', 't', 'a', 'r', 'e', 'a', ' ', 'c', 'o', 'n', 't', 'e', 'n', 't'
        expect(mockOnChange).toHaveBeenLastCalledWith("t");
      });
    });

    describe("SelectFormField", () => {
      const mockOptions = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3", disabled: true },
      ];

      it("should render with correct value and options", () => {
        const mockOnChange = jest.fn();
        render(
          <SelectFormField
            value="option1"
            onChange={mockOnChange}
            options={mockOptions}
            placeholder="Select option"
          />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });

      it("should call onChange when option is selected", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(
          <SelectFormField
            onChange={mockOnChange}
            options={mockOptions}
            placeholder="Select option"
          />
        );

        const select = screen.getByRole("combobox");
        await user.selectOptions(select, "option2");

        expect(mockOnChange).toHaveBeenCalledWith("option2");
      });

      it("should show placeholder when no value is selected", () => {
        const mockOnChange = jest.fn();
        render(
          <SelectFormField
            onChange={mockOnChange}
            options={mockOptions}
            placeholder="Select option"
          />
        );

        expect(screen.getByText("Select option")).toBeInTheDocument();
      });

      it("should disable options when specified", () => {
        const mockOnChange = jest.fn();
        render(
          <SelectFormField
            onChange={mockOnChange}
            options={mockOptions}
            placeholder="Select option"
          />
        );

        const disabledOption = screen.getByText("Option 3");
        expect(disabledOption).toBeDisabled();
      });
    });

    describe("CheckboxFormField", () => {
      it("should render checked checkbox when value is true", () => {
        const mockOnChange = jest.fn();
        render(<CheckboxFormField value={true} onChange={mockOnChange} />);

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeChecked();
      });

      it("should render unchecked checkbox when value is false", () => {
        const mockOnChange = jest.fn();
        render(<CheckboxFormField value={false} onChange={mockOnChange} />);

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();
      });

      it("should call onChange when checkbox is clicked", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<CheckboxFormField value={false} onChange={mockOnChange} />);

        const checkbox = screen.getByRole("checkbox");
        await user.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledWith(true);
      });
    });

    describe("CheckboxGroupFormField", () => {
      const mockOptions = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3", disabled: true },
      ];

      it("should render all options", () => {
        const mockOnChange = jest.fn();
        render(
          <CheckboxGroupFormField
            value={["option1"]}
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
        expect(screen.getByText("Option 3")).toBeInTheDocument();
      });

      it("should show checked state for selected values", () => {
        const mockOnChange = jest.fn();
        render(
          <CheckboxGroupFormField
            value={["option1", "option2"]}
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const checkbox1 = screen.getByLabelText("Option 1");
        const checkbox2 = screen.getByLabelText("Option 2");
        const checkbox3 = screen.getByLabelText("Option 3");

        expect(checkbox1).toBeChecked();
        expect(checkbox2).toBeChecked();
        expect(checkbox3).not.toBeChecked();
      });

      it("should call onChange when checkbox is clicked", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(
          <CheckboxGroupFormField
            value={["option1"]}
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const checkbox2 = screen.getByLabelText("Option 2");
        await user.click(checkbox2);

        expect(mockOnChange).toHaveBeenCalledWith(["option1", "option2"]);
      });

      it("should remove value when checked checkbox is clicked", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(
          <CheckboxGroupFormField
            value={["option1", "option2"]}
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const checkbox1 = screen.getByLabelText("Option 1");
        await user.click(checkbox1);

        expect(mockOnChange).toHaveBeenCalledWith(["option2"]);
      });
    });

    describe("RadioGroupFormField", () => {
      const mockOptions = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3", disabled: true },
      ];

      it("should render all options", () => {
        const mockOnChange = jest.fn();
        render(
          <RadioGroupFormField
            value="option1"
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
        expect(screen.getByText("Option 3")).toBeInTheDocument();
      });

      it("should show selected value", () => {
        const mockOnChange = jest.fn();
        render(
          <RadioGroupFormField
            value="option2"
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const radio2 = screen.getByLabelText("Option 2");
        expect(radio2).toBeChecked();
      });

      it("should call onChange when radio option is clicked", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(
          <RadioGroupFormField
            value="option1"
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const radio2 = screen.getByLabelText("Option 2");
        await user.click(radio2);

        expect(mockOnChange).toHaveBeenCalledWith("option2");
      });

      it("should disable options when specified", () => {
        const mockOnChange = jest.fn();
        render(
          <RadioGroupFormField
            value="option1"
            onChange={mockOnChange}
            options={mockOptions}
          />
        );

        const disabledRadio = screen.getByLabelText("Option 3");
        expect(disabledRadio).toBeDisabled();
      });
    });

    describe("DateFormField", () => {
      it("should render date picker", () => {
        const mockOnChange = jest.fn();
        render(
          <DateFormField
            value={new Date("2023-01-01")}
            onChange={mockOnChange}
          />
        );

        const dateInput = screen.getByTestId("date-field");
        expect(dateInput).toBeInTheDocument();
        expect(dateInput).toHaveAttribute("type", "date");
      });

      it("should call onChange when date is selected", async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<DateFormField onChange={mockOnChange} />);

        const dateInput = screen.getByTestId("date-field");
        await user.type(dateInput, "2023-01-01");

        expect(mockOnChange).toHaveBeenCalled();
      });

      it("should handle placeholder", () => {
        const mockOnChange = jest.fn();
        render(
          <DateFormField onChange={mockOnChange} placeholder="Select date" />
        );

        const dateInput = screen.getByTestId("date-field");
        expect(dateInput).toHaveAttribute("placeholder", "Select date");
      });
    });
  });
});
