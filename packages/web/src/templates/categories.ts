import type { TemplateCategory } from "./types";

export type TemplateCategoryPage = {
  slug: TemplateCategory;
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
};

export const TEMPLATE_CATEGORY_PAGES: Record<TemplateCategory, TemplateCategoryPage> = {
  intake: {
    slug: "intake",
    label: "Intake",
    heading: "Intake Forms",
    metaTitle: "Intake form templates",
    metaDescription:
      "Client, customer, and employee intake form templates. Capture the first handoff in a FormBro schema you can preview and rebuild.",
    intro:
      "Intake forms collect the first clean record of a person, company, or job so the next team can act without a follow-up email.",
    about: {
      heading: "About intake forms",
      body: "An intake form is the start of an ops workflow. It asks for identity, context, and what should happen after submit. FormBro templates keep that to the fields you can actually store today, then leave the rest for the builder.",
    },
    useCases: [
      "Client onboarding for a service business",
      "New customer setup before the first kickoff",
      "Employee first-day intake for HR and IT",
    ],
  },
  registration: {
    slug: "registration",
    label: "Registration",
    heading: "Registration Forms",
    metaTitle: "Registration form templates",
    metaDescription:
      "Registration form templates for workshops, courses, memberships, vendors, and waitlists. Preview a live FormBro schema, then start your own.",
    intro:
      "Registration forms collect who is signing up, what they are signing up for, and enough contact detail to confirm the spot.",
    about: {
      heading: "About registration forms",
      body: "Use a registration form when someone needs to join a roster: a course, a club, a vendor list, or a waitlist. The schema should stay short enough to finish on a phone and still give the organizer a usable record.",
    },
    useCases: [
      "Workshop and course sign-up",
      "Club and membership registration",
      "Vendor and volunteer rosters",
      "Waitlists when a session is full",
    ],
  },
  "event-registration": {
    slug: "event-registration",
    label: "Event registration",
    heading: "Event Registration Forms",
    metaTitle: "Event registration form templates",
    metaDescription:
      "Event registration form templates for workshops, conferences, and RSVPs. Collect attendees, tracks, and guest notes in a live FormBro preview.",
    intro:
      "Event registration forms reserve a seat, capture attendee details, and tell the host what to plan for on the day.",
    about: {
      heading: "About event registration forms",
      body: "These are registration forms with an event attached: a workshop, a conference, or a gathering that needs a guest count. Session tracks, dietary notes, and RSVP status belong here. Recurring memberships and vendor onboarding do not.",
    },
    useCases: [
      "Conference and seminar attendee lists",
      "Workshop seat reservations",
      "RSVPs for hosted events",
    ],
  },
  "order-form": {
    slug: "order-form",
    label: "Order",
    heading: "Order Forms",
    metaTitle: "Order form templates",
    metaDescription:
      "Order form templates for products, wholesale, supplies, catering, quotes, and internal purchases. Preview the FormBro schema, then make it your own.",
    intro:
      "Order forms collect what someone wants, how many, where it goes, and who needs to approve it — from a product order to catering and supplies.",
    about: {
      heading: "About order forms",
      body: "An order form is a structured buy or quote request. These templates use the fields FormBro supports today to capture the buyer, item, quantity, timing, estimate, and fulfillment notes.",
    },
    useCases: [
      "Internal purchase requests",
      "Quote requests with scope and budget",
      "Product and wholesale orders",
      "Supply and catering coordination",
    ],
  },
  request: {
    slug: "request",
    label: "Request",
    heading: "Request Forms",
    metaTitle: "Request form templates",
    metaDescription:
      "Request form templates for service, IT, work, and purchase handoffs. Route a job with owner, priority, and a clean next step.",
    intro:
      "Request forms turn a messy ask into a record someone can dispatch: site, owner, priority, and what done looks like.",
    about: {
      heading: "About request forms",
      body: "Use a request form when work has to move between people. The useful fields are who asked, how urgent it is, and a short brief. Links stand in for photos and tickets until file upload exists.",
    },
    useCases: [
      "Field service and facilities dispatch",
      "Internal work and IT requests",
      "Purchase and quote requests",
    ],
  },
  application: {
    slug: "application",
    label: "Application",
    heading: "Application Forms",
    metaTitle: "Application form templates",
    metaDescription:
      "Application form templates for jobs and vendors. Assess a candidate or supplier before they join the roster.",
    intro:
      "Application forms assess whether someone is a fit. Registration records them. Application decides.",
    about: {
      heading: "About application forms",
      body: "An application asks for proof: a resume link, references, specialty, or tax details. It should be obvious this is a review, not an automatic yes.",
    },
    useCases: [
      "Job applications with a resume link",
      "Vendor applications before onboarding",
      "Supplier assessment for accounting",
    ],
  },
  inquiry: {
    slug: "inquiry",
    label: "Inquiry",
    heading: "Inquiry Forms",
    metaTitle: "Inquiry and contact form templates",
    metaDescription:
      "Inquiry form templates for contact, sales, products, partnerships, admissions, and events. Start with a focused FormBro schema for the first conversation.",
    intro:
      "Inquiry forms are the shortest path from interest to a useful reply, with just enough context to reach the right person.",
    about: {
      heading: "About inquiry forms",
      body: "Keep inquiry forms focused. Name, email, and the question are the base; add only the context needed to route a sales, product, admissions, partnership, or event conversation.",
    },
    useCases: [
      "Website contact and product questions",
      "Sales and partnership outreach",
      "Admissions and program questions",
      "Venue and event planning",
    ],
  },
  feedback: {
    slug: "feedback",
    label: "Feedback",
    heading: "Feedback Forms",
    metaTitle: "Feedback form templates",
    metaDescription:
      "Feedback and evaluation form templates for events, courses, and customers. A score and one note is enough to improve the next pass.",
    intro:
      "Feedback forms collect a score and what happened so the next event, course, or ticket is better.",
    about: {
      heading: "About feedback forms",
      body: "A useful feedback form is short. Score, context, and a comment. Rating is a select until a native rating field ships.",
    },
    useCases: ["Event recap", "Course evaluation", "Customer follow-up"],
  },
};

export function getTemplateCategoryPage(slug: string): TemplateCategoryPage | undefined {
  return Object.hasOwn(TEMPLATE_CATEGORY_PAGES, slug)
    ? TEMPLATE_CATEGORY_PAGES[slug as TemplateCategory]
    : undefined;
}
