export const FORM_EXAMPLES = {
  contact: {
    label: "Simple Contact Form",
    value: [
      {
        name: "name",
        label: "Full Name",
        type: "TEXT",
        placeholder: "Enter your full name",
        required: true,
        validation: {
          minLength: 12,
          maxLength: 50,
        },
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
    value: [
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
    value: [
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
        type: "CHECKBOX",
        required: true,
      },
    ],
  },

  jobApplication: {
    label: "Job Application Form",
    value: [
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
    value: [
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
