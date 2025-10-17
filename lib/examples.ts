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
} as const;
