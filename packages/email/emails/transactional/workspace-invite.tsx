import { APP_NAME } from "@formbro/shared/brand";
import { Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import Card from "../../components/card";
import { CTA } from "../../components/cta";
import Tailwind, { type Theme } from "../../components/tailwind";

export function WorkspaceInviteSubject({ workspaceName }: { workspaceName: string }) {
  return `Join ${workspaceName} on ${APP_NAME}`;
}

function formatInviteExpiration(expiresTime: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(expiresTime));
}

type WorkspaceInviteProps = {
  acceptUrl: string;
  expiresTime: number;
  inviterName: string;
  theme?: Theme;
  workspaceName: string;
};

export default function WorkspaceInviteComponent({
  acceptUrl,
  expiresTime,
  inviterName,
  theme = "system",
  workspaceName,
}: WorkspaceInviteProps) {
  return (
    <Html>
      <Tailwind mode={theme}>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Preview>
          {inviterName} invited you to join {workspaceName} on {APP_NAME}.
        </Preview>
        <Card utmMedium="workspace-invite">
          <Section>
            <Text className="dark:text-muted-foreground-dark m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Workspace invite
            </Text>
            <Heading className="mx-0 mt-3 mb-0 p-0 text-3xl font-bold">
              Join {workspaceName}
            </Heading>
          </Section>

          <Section className="mt-8">
            <Text className="m-0 text-base leading-7">
              {inviterName} invited you to collaborate in {workspaceName} on {APP_NAME}.
            </Text>
            <Text className="dark:text-muted-foreground-dark mt-5 mb-0 text-sm leading-6 text-muted-foreground">
              Accept the invite to create, edit, publish, and review forms with the rest of the
              workspace.
            </Text>
          </Section>

          <CTA href={acceptUrl}>Accept invite</CTA>

          <Text className="dark:text-muted-foreground-dark mt-8 mb-0 text-center text-xs leading-5 text-muted-foreground">
            This invite expires {formatInviteExpiration(expiresTime)}.
          </Text>
        </Card>
      </Tailwind>
    </Html>
  );
}

WorkspaceInviteComponent.PreviewProps = {
  acceptUrl: "https://formbro.com/invite/preview-token",
  expiresTime: Date.now() + 1000 * 60 * 60 * 24 * 7,
  inviterName: "Jane Doe",
  theme: "system",
  workspaceName: "Acme Inc",
} satisfies WorkspaceInviteProps;
