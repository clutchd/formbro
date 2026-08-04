import { HostedFormPage } from "../../e/[form]/hosted-page";

export const revalidate = 60;
export const dynamic = "force-static";

export default async function GuardedInnerEmbedPage({
  params,
}: {
  params: Promise<{ form: string }>;
}) {
  const { form: publicId } = await params;
  return <HostedFormPage allowRestricted publicId={publicId} />;
}
