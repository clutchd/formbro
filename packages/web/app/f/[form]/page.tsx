import { api } from "@formbro/convex/_generated/api";
import { APP_URL } from "@formbro/shared/brand";
import { Button } from "@formbro/ui/button";
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
    <div className="flex min-h-dvh flex-col bg-background pb-10">
      <PublicForm form={form} />
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
