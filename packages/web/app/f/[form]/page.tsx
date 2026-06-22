import { api } from "@formbro/convex/_generated/api";
import { APP_URL } from "@formbro/shared/brand";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { getFormMetadata } from "@/lib/form-metadata";
import { PublicForm } from "./public-form";

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }) {
  const { form: formSlug } = await params;
  const form = await fetchQuery(api.forms.getPublic, { slug: formSlug });

  return getFormMetadata({
    formSlug: form?.data?.slug ?? formSlug,
    formName: form?.data?.name,
    workspaceName: form?.data?.workspace.name,
    baseUrl: APP_URL,
  });
}

export default async function PublicFormPage({ params }: { params: Promise<{ form: string }> }) {
  const { form: formSlug } = await params;
  const form = await fetchQuery(api.forms.getPublic, { slug: formSlug });
  const footerHref = form
    ? `${APP_URL}?utm_source=form&utm_medium=branding&utm_campaign=${encodeURIComponent(form.data.slug)}&utm_content=${encodeURIComponent(form.data.workspace.slug ?? "unknown")}&utm_term=footer`
    : `${APP_URL}?utm_source=form&utm_medium=branding&utm_campaign=not_found&utm_content=${encodeURIComponent(formSlug)}&utm_term=footer`;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicForm form={form} />
      <footer className="border-t bg-background/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-center">
          <Link
            href={footerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Powered by</span>
            <span className="font-display font-bold tracking-tight">FormBro</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
