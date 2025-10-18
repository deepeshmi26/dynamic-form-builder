export const FORM_EXAMPLES = {
  simpleContactForm: {
    label: "Simple Contact Form",
    settings: {
     
    },
    fields: [
      {
        name: "dob",
        label: "Date of Birth",
        type: "DATE",
        placeholder: "Select your birth date",
        required: true,
      },
      {
        name: "name",
        label: "Full Name",
        type: "TEXT",
        placeholder: "Enter your full name",
        required: true,
        validator: {
          minLength: 12,
          maxLength: 50,
        },
      },
      
      {
        name: "favoriteFood",
        label: "Select your favorite food",
        type: "CHECKBOX",
        required: true,
        options: [
          { value: "pizza", label: "Pizza" },
          { value: "burger", label: "Burger" },
          { value: "salad", label: "Salad" },
          { value: "sushi", label: "Sushi" },
        ],
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
        name: "socialHandles",
        label: "Social media handles",
        type: "ARRAY",
        structure: [
          {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            placeholder: "Select platform",
            options: [
              { value: "linkedin", label: "LinkedIn" },
              { value: "instagram", label: "Instagram" },
            ],
            required: true,
            onConditionMatch: [
              {
                if: {
                  properties: {
                    platform: { const: "linkedin" },
                  },
                },
                then: {
                  url: {
                    required: true,
                  },
                },
              },
            ],
          },
          {
            name: "url",
            label: "Profile URL",
            type: "TEXT",
            placeholder: "Enter the profile URL",
            // required: true,
            validator:{
              type: "string",
              minLength: 10,
            }
          },
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
  },
  contactFormWithSemanticStyling: {
    label: "Simple Contact Form (with Semantic Styling)",
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
        name: "dob",
        label: "Date of Birth",
        type: "DATE",
        placeholder: "Select your birth date",
        required: true,
        classNames: {
          body: "border-b border-gray-200 pb-4",
          label: "text-blue-600 font-semibold",
          field: "bg-white border-2 border-blue-200",
        },
      },
      {
        name: "name",
        label: "Full Name",
        type: "TEXT",
        placeholder: "Enter your full name",
        classNames: {
          body: "bg-green-50 p-3 rounded",
          label: "text-green-700 font-bold",
        },
        validator: {
          minLength: 12,
          maxLength: 50,
        },
      },
      {
        name: "favoriteFood",
        label: "Select your favorite food",
        type: "CHECKBOX",
        required: true,
        options: [
          { value: "pizza", label: "Pizza" },
          { value: "burger", label: "Burger" },
          { value: "salad", label: "Salad" },
          { value: "sushi", label: "Sushi" },
        ],
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
        name: "socialHandles",
        label: "Social media handles",
        type: "ARRAY",
        structure: [
          {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            placeholder: "Select platform",
            options: [
              { value: "linkedin", label: "LinkedIn" },
              { value: "instagram", label: "Instagram" },
            ],
            required: true,
            
          },
          {
            name: "url",
            label: "Profile URL",
            type: "TEXT",
            placeholder: "Enter the profile URL",
            // required: true,
            validator:{
              type: "string",
              minLength: 10,
            }
          },
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
  },
  contactFormWithArray: {
    label: "Simple Contact Form (with Array)",
    fields: [
      {
        name: "socialHandles",
        label: "Social media handles",
        type: "ARRAY",
        structure: [
          {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            placeholder: "Select platform",
            options: [
              { value: "linkedin", label: "LinkedIn" },
              { value: "instagram", label: "Instagram" },
            ],
            required: true,
            
          },
          {
            name: "url",
            label: "Profile URL",
            type: "TEXT",
            placeholder: "Enter the profile URL",
            required: true,
            validator:{
              type: "string",
              minLength: 10,
            }
          },
        ],
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "DATE",
        placeholder: "Select your birth date",
        required: true,
      },
      {
        name: "name",
        label: "Full Name",
        type: "TEXT",
        placeholder: "Enter your full name",
        required: true,
        validator: {
          minLength: 12,
          maxLength: 50,
        },
      },
      
      {
        name: "favoriteFood",
        label: "Select your favorite food",
        type: "CHECKBOX",
        required: true,
        options: [
          { value: "pizza", label: "Pizza" },
          { value: "burger", label: "Burger" },
          { value: "salad", label: "Salad" },
          { value: "sushi", label: "Sushi" },
        ],
      },
    ],
  },
  contactFormWithAdapter: {
    label: "Simple Contact Form (with Adapter)",
    fields: [
      {
        name: "socialHandles",
        label: "Social media handles",
        type: "ARRAY",
        structure: [
          {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            placeholder: "Select platform",
            options: [
              { value: "linkedin", label: "LinkedIn" },
              { value: "instagram", label: "Instagram" },
            ],
            required: true,
            
          },
          {
            name: "url",
            label: "Profile URL",
            type: "TEXT",
            placeholder: "Enter the profile URL",
            required: true,
            validator:{
              type: "string",
              minLength: 10,
            }
          },
        ],
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "DATE",
        placeholder: "Select your birth date",
        required: true,
      },
      {
        name: "name",
        label: "Full Name",
        type: "TEXT",
        renderComponent: "SPECIAL_INPUT",
        placeholder: "Enter your full name",
        required: true,
        validator: {
          minLength: 12,
          maxLength: 50,
        },
      },
      
      {
        name: "favoriteFood",
        label: "Select your favorite food",
        type: "CHECKBOX",
        required: true,
        options: [
          { value: "pizza", label: "Pizza" },
          { value: "burger", label: "Burger" },
          { value: "salad", label: "Salad" },
          { value: "sushi", label: "Sushi" },
        ],
      },
    ],
  },


  feedback: {
    label: "Product Feedback Form (horizontal layout)",
    settings: {
      layout: "horizontal",
    },
    fields: [
      {
        name: "productRating",
        label: "How would you rate our product?",
        type: "RADIO",
        required: true,
        options: [
          { value: "5", label: "Excellent" },
          { value: "4", label: "Good" },
          { value: "3", label: "Average" },
          { value: "2", label: "Fair" },
          { value: "1", label: "Poor" },
        ],
      },
      {
        name: "usageFrequency",
        label: "How often do you use our product?",
        type: "SELECT",
        placeholder: "Select frequency",
        required: true,
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "rarely", label: "Rarely" },
        ],
      },
      {
        name: "improvements",
        label: "What could we improve?",
        type: "CHECKBOX",
        options: [
          { value: "ui", label: "User Interface" },
          { value: "speed", label: "Performance" },
          { value: "features", label: "Features" },
          { value: "support", label: "Customer Support" },
        ],
      },
      {
        name: "comments",
        label: "Additional Comments",
        type: "TEXTAREA",
        placeholder: "Share your thoughts...",
      },
    ],
  },

  jobApplication: {
    label: "Job Application Form (conditional visibility)",
    fields: [
      {
        name: "position",
        label: "Position Applied For (Select Software Developer to show programming languages)" ,
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
        type: "SELECT",
        required: true,
        options: Array.from({ length: 20 }, (_, i) => ({
          value: String(i + 1),
          label: `${i + 1} ${i === 0 ? "year" : "years"}`,
        })),
      },
      {
        name: "workLocation",
        label: "Preferred Work Location (Select On-site to show relocation willing)",
        type: "RADIO",
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
        type: "RADIO",
        visible: false,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },

  
} as const;
