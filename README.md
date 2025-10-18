# Dynamic Form Builder

A powerful, flexible React form builder that generates forms from JSON configuration. Built with React Hook Form, TypeScript, and Tailwind CSS, it supports dynamic field rendering, conditional logic, validation, and custom styling.

## 📋 Table of Contents

- [Short Summary](#short-summary)
- [Installation & Run Instructions](#installation--run-instructions)
- [Features](#features)
- [Code Example](#code-example)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## 🚀 Short Summary

Dynamic Form Builder is a React component library that allows you to create complex, interactive forms using simple JSON configuration. It supports various field types, conditional rendering, validation, custom styling, and dynamic field updates. Perfect for building dynamic surveys, contact forms, job applications, and any form that needs to adapt based on user input.

## 🛠 Installation & Run Instructions

### Prerequisites

- Node.js >= 22.0.0
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynamic-form-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## ✨ Features

### Core Features
- **JSON-Driven Forms**: Define forms using simple JSON configuration
- **Multiple Field Types**: Support for text, textarea, select, checkbox, radio, date, and array fields
- **Validation**: Built-in validation with customizable rules
- **Layout Support**: Vertical and horizontal form layouts
- **Custom Styling**: Tailwind CSS classes for complete design control
- **TypeScript**: Full TypeScript support with comprehensive type definitions

### Advanced Features
- **Dynamic Field Updates**: Fields can update other fields based on conditions
- **Nested Arrays**: Support for complex nested array structures
- **Adapter Pattern**: Extensible architecture for custom field components
- **Performance Optimized**: Debounced validation and dynamic field loading
- **Semantic ClassNames**: Consistent styling system with semantic class names

### Field Types Supported
- `TEXT` - Single line text input
- `TEXTAREA` - Multi-line text input
- `SELECT` - Dropdown selection
- `CHECKBOX` - Multiple choice checkboxes
- `RADIO` - Single choice radio buttons
- `DATE` - Date picker
- `ARRAY` - Dynamic array of fields
- `BOOLEAN` - True/false checkbox

## 💻 Code Example

### Basic Form Configuration

```typescript
import { FormBuilder } from '@/components/dynamic-form-builder/FormBuilder';
import { Button } from '@/components/ui/button';

const formConfig = {
  label: "Contact Form",
  settings: {
    layout: "vertical",
    className: "max-w-md mx-auto p-6 bg-white rounded-lg shadow-md",
  },
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "TEXT",
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
      type: "TEXT",
      placeholder: "Enter your email",
      required: true,
      validator: {
        pattern: "^[A-Za-z0-9._-]+@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$",
      },
    },
    {
      name: "country",
      label: "Country",
      type: "SELECT",
      placeholder: "Select your country",
      required: true,
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "uk", label: "United Kingdom" },
        { value: "au", label: "Australia" },
      ],
    },
    {
      name: "interests",
      label: "Areas of Interest",
      type: "CHECKBOX",
      options: [
        { value: "tech", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "business", label: "Business" },
      ],
    },
    {
      name: "message",
      label: "Message",
      type: "TEXTAREA",
      placeholder: "Enter your message",
      required: true,
    },
  ],
};

function ContactForm() {
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <FormBuilder formConfig={formConfig} onSubmit={handleSubmit}>
      <Button type="submit" className="w-full">
        Submit Form
      </Button>
    </FormBuilder>
  );
}
```

### Advanced Form with Conditional Logic

```typescript
const advancedFormConfig = {
  label: "Job Application",
  settings: {
    layout: "vertical",
    className: "max-w-2xl mx-auto p-6",
  },
  fields: [
    {
      name: "position",
      label: "Position Applied For",
      type: "SELECT",
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
      type: "SELECT",
      visible: false,
      options: [
        { value: "javascript", label: "JavaScript" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "csharp", label: "C#" },
      ],
    },
    {
      name: "experience",
      label: "Years of Experience",
      type: "RADIO",
      required: true,
      options: [
        { value: "0-1", label: "0-1 years" },
        { value: "2-5", label: "2-5 years" },
        { value: "5+", label: "5+ years" },
      ],
    },
  ],
};

function JobApplicationForm() {
  const handleSubmit = (data: any) => {
    console.log('Application submitted:', data);
  };

  return (
    <FormBuilder formConfig={advancedFormConfig} onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <Button type="submit" variant="default">
          Submit Application
        </Button>
        <Button type="button" variant="outline">
          Save Draft
        </Button>
      </div>
    </FormBuilder>
  );
}
```

### Array Field Example

```typescript
const arrayFormConfig = {
  label: "Social Media Profiles",
  fields: [
    {
      name: "profiles",
      label: "Social Media Profiles",
      type: "ARRAY",
      structure: [
        {
          name: "platform",
          label: "Platform",
          type: "SELECT",
          required: true,
          options: [
            { value: "linkedin", label: "LinkedIn" },
            { value: "twitter", label: "Twitter" },
            { value: "github", label: "GitHub" },
          ],
        },
        {
          name: "url",
          label: "Profile URL",
          type: "TEXT",
          placeholder: "https://...",
          required: true,
          validator: {
            pattern: "^https?://.+",
          },
        },
      ],
    },
  ],
};
```

## 📚 API Reference

### FormBuilder Props

| Prop | Type | Description |
|------|------|-------------|
| `formConfig` | `FormConfig` | JSON configuration object defining the form |
| `onSubmit` | `SubmitHandler<T>` | Callback function called when form is submitted |
| `adapter` | `Record<string, ComponentType>` | Custom field component adapters |
| `initialValues` | `DefaultValues<T>` | Initial form values |
| `onChange` | `(fieldName, value, allValues) => void` | Callback for field value changes |

### FormConfig Structure

```typescript
interface FormConfig {
  label?: string;
  settings?: FormSettings;
  fields?: FormFieldConfig[];
}

interface FormSettings {
  layout?: "vertical" | "horizontal";
  className?: string;
  defaultClassNames?: {
    body?: string;
    label?: string;
    field?: string;
  };
}

interface FormFieldConfig {
  name: string;
  label: React.ReactNode;
  type: FormItemType;
  options?: FormOption[];
  placeholder?: string;
  validator?: Record<string, unknown>;
  visible?: boolean;
  required?: boolean;
  structure?: FormFieldConfig[];
  classNames?: {
    body?: string;
    label?: string;
    field?: string;
  };
  onConditionMatch?: ConditionalRule[];
}
```

---

Built with ❤️ using React, TypeScript, and Tailwind CSS.