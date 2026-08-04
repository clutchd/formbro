import { HostedFormPage } from "./hosted-page";

export const revalidate = 60;
export const dynamic = "force-static";

export default async function HostedEmbedPage({ params }: { params: Promise<{ form: string }> }) {
  const { form: publicId } = await params;
  return <HostedFormPage allowRestricted={false} publicId={publicId} />;
}
