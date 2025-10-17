export const FORM_EXAMPLES = {
  contact: {
    label: "Simple Contact Form",
    settings: {
      enabledebounce: true,
      layout: "vertical",
      className: "bg-gray-50 p-6 rounded-lg",
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
        required: true,
        classNames: {
          body: "bg-green-50 p-3 rounded",
          label: "text-green-700 font-bold",
          field: "ring-2 ring-green-300 focus:ring-green-500",
        },
        validation: {
          minLength: 12,
          maxLength: 50,
        },
      },
      {
        name: "phoneNumber",
        label: "Phone Number",
        type: "TEXT",
        placeholder: "Enter your phone number",
        onConditionMatch: [
          {
            if: {
              properties: {
                phoneNumber: {
                  pattern: "^\\+?[1-9][0-9]{7,14}$",
                },
              },
            },
            then: {
              preferredContact: {
                visible: true,
                required: true,
              },
            },
            else: {
              preferredContact: {
                visible: true,
                required: false,
              },
            },
          },
        ],
      },
      {
        name: "preferredContact",
        label: "Preferred Contact Method",
        type: "SELECT",
        placeholder: "Select contact method",
        options: [
          { value: "phone", label: "Phone" },
          { value: "email", label: "Email" },
          { value: "both", label: "Both Phone and Email" },
        ],
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
        validation: {
          pattern: "^[A-Za-z0-9._-]+@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$",
        },
      },
      {
        name: "socialHandles",
        label: "Social media handles",
        type: "ARRAY_INLINE",
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

  feedback: {
    label: "Product Feedback Form",
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

  subscription: {
    label: "Newsletter Subscription",
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "TEXT",
        placeholder: "Enter your email",
        required: true,
        validation: {
          pattern: "^[A-Za-z0-9._-]+@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$",
        },
      },
      {
        name: "interests",
        label: "Topics of Interest",
        type: "CHECKBOX",
        required: true,
        options: [
          { value: "tech", label: "Technology" },
          { value: "design", label: "Design" },
          { value: "business", label: "Business" },
          { value: "lifestyle", label: "Lifestyle" },
        ],
      },
      {
        name: "frequency",
        label: "Email Frequency",
        type: "RADIO",
        required: true,
        options: [
          { value: "daily", label: "Daily Digest" },
          { value: "weekly", label: "Weekly Roundup" },
          { value: "monthly", label: "Monthly Newsletter" },
        ],
      },
      {
        name: "terms",
        label: "I agree to receive marketing emails",
        type: "BOOLEAN",
        required: true,
      },
    ],
  },

  jobApplication: {
    label: "Job Application Form",
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
        type: "SELECT",
        required: true,
        options: Array.from({ length: 20 }, (_, i) => ({
          value: String(i + 1),
          label: `${i + 1} ${i === 0 ? "year" : "years"}`,
        })),
      },
      {
        name: "workLocation",
        label: "Preferred Work Location",
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

  dynamicSurvey: {
    label: "Dynamic Customer Survey",
    fields: [
      {
        name: "customerType",
        label: "What type of customer are you?",
        type: "SELECT",
        required: true,
        options: [
          { value: "business", label: "Business" },
          { value: "individual", label: "Individual" },
        ],
        onConditionMatch: [
          {
            if: {
              properties: {
                customerType: { const: "business" },
              },
            },
            then: {
              companySize: {
                visible: true,
                required: true,
              },
              industry: {
                visible: true,
                required: true,
              },
            },
            else: {
              companySize: {
                visible: false,
                required: false,
              },
              industry: {
                visible: false,
                required: false,
              },
            },
          },
        ],
      },
      {
        name: "companySize",
        label: "Company Size",
        type: "SELECT",
        visible: false,
        options: Array.from({ length: 6 }, (_, i) => {
          const ranges = [
            "1-10",
            "11-50",
            "51-200",
            "201-500",
            "501-1000",
            "1000+",
          ];
          return { value: String(i), label: ranges[i] };
        }),
      },
      {
        name: "industry",
        label: "Industry",
        type: "SELECT",
        visible: false,
        options: [
          { value: "tech", label: "Technology" },
          { value: "finance", label: "Finance" },
          { value: "healthcare", label: "Healthcare" },
          { value: "retail", label: "Retail" },
        ],
      },
    ],
  },
} as const;
