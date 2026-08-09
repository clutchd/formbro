import { APP_NAME } from "@formbro/shared/brand";
import { Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import Card from "../../components/card";
import { CTA } from "../../components/cta";
import Tailwind, { type Theme } from "../../components/tailwind";

export function SubmissionNotificationSubject({ formName }: { formName: string }) {
  const safeFormName = formName.replace(/[\r\n]+/g, " ").trim();
  return `New submission for ${safeFormName}`;
}

type SubmissionNotificationProps = {
  formName: string;
  submissionsUrl: string;
  theme?: Theme;
  workspaceName: string;
};

export default function SubmissionNotificationComponent({
  formName,
  submissionsUrl,
  theme = "system",
  workspaceName,
}: SubmissionNotificationProps) {
  return (
    <Html>
      <Tailwind mode={theme}>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Preview>{formName} received a new submission.</Preview>
        <Card utmMedium="submission-notification">
          <Section>
            <Text className="dark:text-muted-foreground-dark m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              New submission
            </Text>
            <Heading className="mx-0 mt-3 mb-0 p-0 text-3xl font-bold">
              {formName} received a response
            </Heading>
          </Section>

          <Section className="mt-8">
            <Text className="m-0 text-base leading-7">
              A new submission was received in {workspaceName}.
            </Text>
            <Text className="dark:text-muted-foreground-dark mt-5 mb-0 text-sm leading-6 text-muted-foreground">
              Open {APP_NAME} to review the response with the rest of your submissions.
            </Text>
          </Section>

          <CTA href={submissionsUrl}>View submissions</CTA>
        </Card>
      </Tailwind>
    </Html>
  );
}

SubmissionNotificationComponent.PreviewProps = {
  formName: "Customer intake",
  submissionsUrl: "https://formbro.com/dashboard/acme/customer-intake/submissions",
  theme: "system",
  workspaceName: "Acme Inc",
} satisfies SubmissionNotificationProps;
