export type FormTemplate = {
  slug: string;
  name: string;
  category: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  introduction: string;
  audiences: readonly string[];
  fields: readonly {
    label: string;
    description: string;
    required?: boolean;
  }[];
  workflow: readonly {
    title: string;
    description: string;
  }[];
  benefits: readonly string[];
  faqs: readonly {
    question: string;
    answer: string;
  }[];
  relatedSlugs: readonly string[];
};

export const FORM_TEMPLATES: readonly FormTemplate[] = [
  {
    slug: "client-intake-form",
    name: "Client Intake Form",
    category: "Client operations",
    seoTitle: "Client Intake Form Template",
    metaDescription:
      "Use this client intake form template to collect contact details, project goals, company size, and next-step requirements in one structured handoff.",
    eyebrow: "Client intake template",
    headline: "Turn a new client into a clean first handoff.",
    introduction:
      "Replace scattered kickoff emails with one focused intake. This template captures who the client is, what they need, and what your team should do after submission.",
    audiences: ["Agencies", "Consultancies", "Freelancers", "Professional services"],
    fields: [
      {
        label: "Client name",
        description: "Identify the person or account entering your workflow.",
        required: true,
      },
      {
        label: "Work email",
        description: "Collect a reliable address for confirmations and follow-up.",
        required: true,
      },
      {
        label: "Company size",
        description: "Give your team useful context before the first conversation.",
      },
      {
        label: "Workflow type",
        description: "Route intake, approval, reporting, or onboarding requests correctly.",
        required: true,
      },
      {
        label: "Desired outcome",
        description: "Capture the next action in the client’s own words.",
        required: true,
      },
    ],
    workflow: [
      {
        title: "Collect the essentials",
        description: "Ask only for the identity and account context your team will actually use.",
      },
      {
        title: "Clarify the job",
        description: "Capture the workflow type and intended outcome before kickoff.",
      },
      {
        title: "Hand off with context",
        description: "Give the owner a structured brief instead of another email thread.",
      },
    ],
    benefits: [
      "Reduce kickoff back-and-forth",
      "Standardize information across clients",
      "Route each request to a clear owner",
      "Keep client-facing forms easy to complete",
    ],
    faqs: [
      {
        question: "What should a client intake form include?",
        answer:
          "Start with contact details, company context, the requested workflow, and the outcome the client expects. Add only fields that change how your team scopes or routes the work.",
      },
      {
        question: "Can I customize this client intake template?",
        answer:
          "Yes. Use the template as a starting point, then change labels, required fields, choices, and the submission button in the FormBro builder.",
      },
      {
        question: "When should I send a client intake form?",
        answer:
          "Send it after a prospect commits to the next step and before kickoff. That timing gives your team useful context without adding friction too early.",
      },
    ],
    relatedSlugs: ["service-request-form", "vendor-onboarding-form"],
  },
  {
    slug: "service-request-form",
    name: "Service Request Form",
    category: "Field operations",
    seoTitle: "Service Request Form Template",
    metaDescription:
      "Use this service request form template to capture site details, request owners, urgency, repair notes, and reference links for faster dispatch.",
    eyebrow: "Service request template",
    headline: "Send every service request to dispatch ready to act.",
    introduction:
      "Give facilities and field teams the location, urgency, owner, and repair details they need in one submission. Fewer clarification calls means a faster response.",
    audiences: ["Facilities teams", "Property managers", "Field operations", "Service desks"],
    fields: [
      {
        label: "Site or property",
        description: "Tell the team exactly where the work is needed.",
        required: true,
      },
      {
        label: "Request owner",
        description: "Give dispatch a person to contact for access or clarification.",
        required: true,
      },
      {
        label: "Owner email",
        description: "Provide a channel for updates and completion notices.",
      },
      {
        label: "Priority",
        description: "Separate routine work from urgent or emergency requests.",
        required: true,
      },
      {
        label: "Request details",
        description: "Describe the issue, deadline, and expected result.",
        required: true,
      },
      {
        label: "Reference link",
        description: "Attach context from a photo library, ticket, or shared file.",
      },
    ],
    workflow: [
      {
        title: "Locate the work",
        description: "Capture the property, site, or asset before the request reaches dispatch.",
      },
      {
        title: "Triage the request",
        description: "Use a consistent priority scale to make the queue easier to manage.",
      },
      {
        title: "Dispatch with confidence",
        description: "Send complete details and a clear contact to the person doing the work.",
      },
    ],
    benefits: [
      "Reduce incomplete work orders",
      "Prioritize requests consistently",
      "Give technicians better context",
      "Create a repeatable dispatch intake",
    ],
    faqs: [
      {
        question: "What information belongs in a service request form?",
        answer:
          "Include the service location, request owner, urgency, a clear description, and any useful reference link. Ask for access instructions or deadlines when they affect dispatch.",
      },
      {
        question: "How do I keep emergency requests from getting buried?",
        answer:
          "Use a required priority field with a small, well-defined set of options. Pair the form with a workflow that immediately routes emergency submissions to the on-call owner.",
      },
      {
        question: "Can this template work for internal IT requests?",
        answer:
          "Yes. Rename the site field to office or device, adjust the priority choices, and add any system-specific information your service desk needs.",
      },
    ],
    relatedSlugs: ["client-intake-form", "vendor-onboarding-form"],
  },
  {
    slug: "vendor-onboarding-form",
    name: "Vendor Onboarding Form",
    category: "Finance operations",
    seoTitle: "Vendor Onboarding Form Template",
    metaDescription:
      "Use this vendor onboarding form template to collect legal names, accounts payable contacts, tax classification, services, spend, and payment terms.",
    eyebrow: "Vendor onboarding template",
    headline: "Collect accounting-ready vendor details once.",
    introduction:
      "Create a consistent path from approved vendor to payable vendor. This template gathers identity, service, spend, and payment information before setup reaches accounting.",
    audiences: ["Finance teams", "Procurement", "Operations", "Accounts payable"],
    fields: [
      {
        label: "Vendor legal name",
        description: "Capture the entity name your accounting records require.",
        required: true,
      },
      {
        label: "Accounts payable email",
        description: "Keep invoice and payment communication with the right contact.",
        required: true,
      },
      {
        label: "Tax classification",
        description: "Collect early classification context for the review process.",
      },
      {
        label: "Services provided",
        description: "Record what the vendor will deliver and who depends on it.",
        required: true,
      },
      {
        label: "Estimated monthly spend",
        description: "Give reviewers useful budget and approval context.",
      },
      {
        label: "Preferred payment terms",
        description: "Surface payment expectations before the first invoice.",
      },
    ],
    workflow: [
      {
        title: "Verify vendor identity",
        description: "Collect the legal name and payable contact in a standard format.",
      },
      {
        title: "Document the relationship",
        description: "Record services, expected spend, and payment terms for review.",
      },
      {
        title: "Send a complete packet",
        description: "Move the submission to accounting with fewer follow-up questions.",
      },
    ],
    benefits: [
      "Standardize vendor setup",
      "Reduce accounting follow-up",
      "Capture spend context earlier",
      "Create a clear procurement handoff",
    ],
    faqs: [
      {
        question: "What should a vendor onboarding form collect?",
        answer:
          "Collect the vendor’s legal identity, payable contact, services, expected spend, and payment terms. Add tax or banking documentation only when your security and compliance process is ready to handle it.",
      },
      {
        question: "Should I collect bank details in this form?",
        answer:
          "Only collect sensitive financial information through a workflow designed for that data. For a general intake, request the minimum context and move bank verification to your approved secure process.",
      },
      {
        question: "Who should review vendor onboarding submissions?",
        answer:
          "Route submissions according to your controls. Operations can verify the business need, procurement can review terms, and accounting can complete payable setup.",
      },
    ],
    relatedSlugs: ["service-request-form", "client-intake-form"],
  },
  {
    slug: "event-registration-form",
    name: "Event Registration Form",
    category: "Events",
    seoTitle: "Event Registration Form Template",
    metaDescription:
      "Use this event registration form template to collect attendee details, company information, session preferences, and workshop goals.",
    eyebrow: "Event registration template",
    headline: "Make registration useful before the event starts.",
    introduction:
      "Capture the attendee details you need to plan capacity and tailor the session. This workshop-ready template keeps registration short while collecting actionable context.",
    audiences: ["Workshop hosts", "Community teams", "Customer education", "Event operators"],
    fields: [
      {
        label: "Attendee name",
        description: "Reserve the seat for the right person.",
        required: true,
      },
      {
        label: "Attendee email",
        description: "Send confirmations, preparation notes, and schedule updates.",
        required: true,
      },
      {
        label: "Company",
        description: "Understand the organizations represented in the room.",
      },
      {
        label: "Session track",
        description: "Plan capacity around the topics attendees select.",
        required: true,
      },
      {
        label: "Workshop goal",
        description: "Learn what would make the session valuable for each attendee.",
      },
    ],
    workflow: [
      {
        title: "Reserve the seat",
        description: "Collect a reliable attendee identity and contact channel.",
      },
      {
        title: "Plan the session",
        description: "Use track choices to prepare rooms, facilitators, and materials.",
      },
      {
        title: "Tailor the experience",
        description: "Review attendee goals before the workshop begins.",
      },
    ],
    benefits: [
      "Keep registration quick",
      "Forecast session demand",
      "Collect useful attendee context",
      "Prepare more relevant workshops",
    ],
    faqs: [
      {
        question: "What fields should an event registration form have?",
        answer:
          "Most events need an attendee name, email, and ticket or session selection. Add company, accessibility, dietary, or goal questions only when the answers change the event experience.",
      },
      {
        question: "How can I improve event registration completion?",
        answer:
          "Keep the first form focused on reserving a seat. Explain why optional questions matter, use a short list of choices, and move nonessential surveys to a later email.",
      },
      {
        question: "Can I adapt this template for a webinar?",
        answer:
          "Yes. Replace the session track with webinar topic or time-zone preferences and use the attendee goal to shape the presentation and follow-up.",
      },
    ],
    relatedSlugs: ["client-intake-form", "service-request-form"],
  },
];

const formTemplatesBySlug = new Map(FORM_TEMPLATES.map((template) => [template.slug, template]));

export function getFormTemplate(slug: string) {
  return formTemplatesBySlug.get(slug);
}
