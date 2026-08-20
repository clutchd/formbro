import type { TemplateDefinition } from "./types";
import { template as admissionsInquiry } from "./specs/admissions-inquiry";
import { template as cateringOrder } from "./specs/catering-order";
import { template as clientIntake } from "./specs/client-intake";
import { template as conferenceRegistration } from "./specs/conference-registration";
import { template as contact } from "./specs/contact";
import { template as courseEvaluation } from "./specs/course-evaluation";
import { template as courseRegistration } from "./specs/course-registration";
import { template as customerFeedback } from "./specs/customer-feedback";
import { template as employeeIntake } from "./specs/employee-intake";
import { template as eventFeedback } from "./specs/event-feedback";
import { template as eventInquiry } from "./specs/event-inquiry";
import { template as itRequest } from "./specs/it-request";
import { template as jobApplication } from "./specs/job-application";
import { template as membershipRegistration } from "./specs/membership-registration";
import { template as newCustomerIntake } from "./specs/new-customer-intake";
import { template as partnershipInquiry } from "./specs/partnership-inquiry";
import { template as productInquiry } from "./specs/product-inquiry";
import { template as productOrder } from "./specs/product-order";
import { template as purchaseRequest } from "./specs/purchase-request";
import { template as quoteRequest } from "./specs/quote-request";
import { template as rsvp } from "./specs/rsvp";
import { template as salesInquiry } from "./specs/sales-inquiry";
import { template as serviceRequest } from "./specs/service-request";
import { template as supplyOrder } from "./specs/supply-order";
import { template as vendorApplication } from "./specs/vendor-application";
import { template as vendorOnboarding } from "./specs/vendor-onboarding";
import { template as vendorRegistration } from "./specs/vendor-registration";
import { template as volunteerRegistration } from "./specs/volunteer-registration";
import { template as waitlist } from "./specs/waitlist";
import { template as wholesaleOrder } from "./specs/wholesale-order";
import { template as workRequest } from "./specs/work-request";
import { template as workshopRegistration } from "./specs/workshop-registration";

export const TEMPLATE_DEFINITIONS: readonly TemplateDefinition[] = [
  clientIntake,
  newCustomerIntake,
  employeeIntake,
  workshopRegistration,
  conferenceRegistration,
  courseRegistration,
  membershipRegistration,
  volunteerRegistration,
  vendorRegistration,
  rsvp,
  waitlist,
  vendorOnboarding,
  jobApplication,
  vendorApplication,
  serviceRequest,
  workRequest,
  itRequest,
  purchaseRequest,
  quoteRequest,
  productOrder,
  wholesaleOrder,
  supplyOrder,
  cateringOrder,
  contact,
  partnershipInquiry,
  salesInquiry,
  productInquiry,
  admissionsInquiry,
  eventInquiry,
  eventFeedback,
  courseEvaluation,
  customerFeedback,
];
