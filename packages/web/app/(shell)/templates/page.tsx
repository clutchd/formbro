import type { Metadata } from "next";
import { APP_NAME } from "@formbro/shared/brand";
import { listTemplates } from "@/templates";
import { LandingPage } from "../../landing-chrome";
import { TemplatesGallery } from "./templates-gallery";

const TITLE = "Form templates";
const DESCRIPTION =
  "Start from an ops-shaped FormBro schema. Preview the live form, then build your own.";

export const metadata: Metadata = {
  title: `${TITLE} | ${APP_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <LandingPage>
      <TemplatesGallery
        templates={listTemplates()}
        heading="Form templates"
        intro="Intake, registration, requests, and feedback — each template is a valid form you can preview, then rebuild in your workspace."
      />
    </LandingPage>
  );
}
