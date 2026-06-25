import { APP_URL } from "@formbro/shared/brand";
import { Button } from "@formbro/ui/button";
import { RiAlertLine, RiFileForbidLine, RiLockLine, RiTimeLine } from "@remixicon/react";
import Link from "next/link";
import { PageState } from "@/components/page-state";
import { getFormMetadata } from "@/lib/form-metadata";
import { getPublicForm, getPublicFormState, type PublicFormState } from "./data";
import { PublicForm } from "./public-form";

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }) {
  const { form: formSlug } = await params;
  const form = await getPublicForm(formSlug);

  return getFormMetadata({
    formSlug: form?.data?.slug ?? formSlug,
    formName: form?.data?.name,
    workspaceName: form?.data?.workspace.name,
    baseUrl: APP_URL,
  });
}

function PublicFormStateView({ state }: { state: PublicFormState }) {
  switch (state.type) {
    case "ready":
      return (
        <PublicForm
          compiledSchema={state.compiledSchema}
          formId={state.formId}
          schemaId={state.schemaId}
        />
      );
    case "closed":
      return (
        <PageState
          icon={<RiLockLine className="size-5" />}
          title="Form closed"
          description="This form is no longer accepting new responses."
          status="warning"
        />
      );
    case "draft":
      return (
        <PageState
          icon={<RiTimeLine className="size-5" />}
          title="Coming soon"
          description="This form is still being prepared and is not accepting responses yet."
        />
      );
    case "unavailable":
      return (
        <PageState
          icon={<RiAlertLine className="size-5" />}
          title="Form unavailable"
          description="This form could not be loaded. Please try again later."
          status="error"
        />
      );
    case "not-found":
      return (
        <PageState
          icon={<RiFileForbidLine className="size-5" />}
          title="Form not found"
          description="This form does not exist or may have been removed by its owner."
          status="error"
        />
      );
  }
}

export default async function PublicFormPage({ params }: { params: Promise<{ form: string }> }) {
  const { form: formSlug } = await params;
  const [form, state] = await Promise.all([getPublicForm(formSlug), getPublicFormState(formSlug)]);
  const footerHref = form
    ? `${APP_URL}?utm_source=form&utm_medium=branding&utm_campaign=${encodeURIComponent(form.data.slug)}&utm_content=${encodeURIComponent(form.data.workspace.slug ?? "unknown")}&utm_term=footer`
    : `${APP_URL}?utm_source=form&utm_medium=branding&utm_campaign=not_found&utm_content=${encodeURIComponent(formSlug)}&utm_term=footer`;

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-10">
      <PublicFormStateView state={state} />
      <footer className="fixed inset-x-0 bottom-0 z-30">
        <Button asChild className="h-10 w-full gap-1 rounded-none border-t text-xs">
          <Link
            href={footerHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by FormBro"
          >
            <span>Powered by</span>
            <span className="font-display font-bold tracking-tight">FormBro</span>
          </Link>
        </Button>
      </footer>
    </div>
  );
}
