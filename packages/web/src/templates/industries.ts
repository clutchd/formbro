import type { TemplateIndustry } from "./types";

export type TemplateIndustryPage = {
  slug: TemplateIndustry;
  label: string;
  heading: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  about: {
    heading: string;
    body: string;
  };
  useCases: string[];
  templateIds: readonly string[];
};

export const TEMPLATE_INDUSTRY_PAGES: Record<TemplateIndustry, TemplateIndustryPage> = {
  hr: {
    slug: "hr",
    label: "HR",
    heading: "HR Forms",
    metaTitle: "HR form templates",
    metaDescription:
      "HR form templates for hiring, onboarding, access, training, and internal requests. Preview a live FormBro schema, then make it your own.",
    intro:
      "Keep hiring, onboarding, training, and internal handoffs moving with forms built around the records HR teams use every day.",
    about: {
      heading: "Forms for HR teams",
      body: "HR workflows cross several form types. Applications assess candidates, intake starts onboarding, and request forms coordinate equipment and access. This collection brings those existing workflows together without creating duplicate schemas.",
    },
    useCases: [
      "Candidate applications and hiring intake",
      "Employee onboarding and access requests",
      "Training registration and evaluation",
    ],
    templateIds: [
      "job_application",
      "employee_intake",
      "it_request",
      "work_request",
      "course_registration",
      "course_evaluation",
    ],
  },
  vendors: {
    slug: "vendors",
    label: "Vendors",
    heading: "Vendor Forms",
    metaTitle: "Vendor form templates",
    metaDescription:
      "Vendor form templates for sourcing, applications, onboarding, registration, quotes, and orders. Reuse a live FormBro schema for procurement work.",
    intro:
      "Move a supplier from first contact to an approved order with forms for sourcing, assessment, onboarding, and purchasing.",
    about: {
      heading: "Forms for vendor workflows",
      body: "Vendor operations are a chain, not one form. An inquiry or application starts the review, onboarding creates the record, and quote and order forms move spend toward approval.",
    },
    useCases: [
      "Supplier qualification and onboarding",
      "Event vendor registration",
      "Quote collection and purchase orders",
    ],
    templateIds: [
      "vendor_application",
      "vendor_onboarding",
      "vendor_registration",
      "purchase_request",
      "quote_request",
      "wholesale_order",
      "supply_order",
      "partnership_inquiry",
    ],
  },
  facilities: {
    slug: "facilities",
    label: "Facilities",
    heading: "Facilities Forms",
    metaTitle: "Facilities form templates",
    metaDescription:
      "Facilities form templates for service calls, work orders, supplies, quotes, catering, and site requests. Start from a live FormBro schema.",
    intro:
      "Give facilities teams the site, urgency, quantity, and scope they need to dispatch work without another round of questions.",
    about: {
      heading: "Forms for facilities teams",
      body: "Facilities work mixes service tickets, internal requests, purchasing, and event support. These templates reuse those core workflows in one practical collection.",
    },
    useCases: [
      "Maintenance and repair dispatch",
      "Supply and equipment purchasing",
      "Catering and event support requests",
    ],
    templateIds: [
      "service_request",
      "work_request",
      "purchase_request",
      "quote_request",
      "supply_order",
      "catering_order",
      "event_inquiry",
    ],
  },
  it: {
    slug: "it",
    label: "IT",
    heading: "IT Forms",
    metaTitle: "IT form templates",
    metaDescription:
      "IT form templates for support, access, equipment, projects, purchasing, and product questions. Preview and reuse a live FormBro schema.",
    intro:
      "Turn support, access, equipment, and project asks into structured records that are ready for an IT queue.",
    about: {
      heading: "Forms for IT teams",
      body: "IT teams receive work from across the company. A useful front door captures the requester, system, urgency, and expected outcome, then routes purchasing and product questions into the same operating model.",
    },
    useCases: [
      "Access, hardware, and incident intake",
      "Equipment purchasing and vendor quotes",
      "Product questions and internal projects",
    ],
    templateIds: [
      "it_request",
      "service_request",
      "work_request",
      "employee_intake",
      "purchase_request",
      "quote_request",
      "product_inquiry",
    ],
  },
  education: {
    slug: "education",
    label: "Education",
    heading: "Education Forms",
    metaTitle: "Education form templates",
    metaDescription:
      "Education form templates for admissions questions, courses, workshops, waitlists, and evaluation. Use the same live FormBro schemas across programs.",
    intro:
      "Run the path from a prospective student's first question through registration, attendance, and course evaluation.",
    about: {
      heading: "Forms for education programs",
      body: "Education workflows need a connected set of forms: inquiry before enrollment, registration for the roster, waitlists for capacity, and feedback after the session.",
    },
    useCases: [
      "Admissions and program inquiries",
      "Course and workshop enrollment",
      "Waitlists and course evaluation",
    ],
    templateIds: [
      "admissions_inquiry",
      "course_registration",
      "workshop_registration",
      "conference_registration",
      "waitlist",
      "course_evaluation",
      "event_feedback",
    ],
  },
  events: {
    slug: "events",
    label: "Events",
    heading: "Event Forms",
    metaTitle: "Event form templates",
    metaDescription:
      "Event form templates for registration, RSVPs, vendors, catering, questions, waitlists, and feedback. Preview a reusable FormBro schema.",
    intro:
      "Cover the full event loop: answer questions, register attendees and vendors, plan catering, manage capacity, and collect feedback.",
    about: {
      heading: "Forms for event teams",
      body: "Events need more than a registration form. This collection follows the operating workflow before, during, and after the event while reusing the same canonical form schemas.",
    },
    useCases: [
      "Conference, workshop, and guest registration",
      "Vendor and catering coordination",
      "Pre-event questions and post-event feedback",
    ],
    templateIds: [
      "conference_registration",
      "workshop_registration",
      "rsvp",
      "vendor_registration",
      "catering_order",
      "event_inquiry",
      "waitlist",
      "event_feedback",
    ],
  },
};

export function getTemplateIndustryPage(slug: string): TemplateIndustryPage | undefined {
  return Object.hasOwn(TEMPLATE_INDUSTRY_PAGES, slug)
    ? TEMPLATE_INDUSTRY_PAGES[slug as TemplateIndustry]
    : undefined;
}
