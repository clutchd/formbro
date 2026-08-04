import type { ReactNode } from "react";
import { NativeForm } from "./native-form";
import { fetchPublishedFormSnapshot } from "./transport";

export type FormBroFormProps = {
  apiUrl?: string;
  className?: string;
  fallback?: ReactNode;
  publicId: string;
  revalidate?: number;
  successMessage?: string;
};

export async function FormBroForm({
  apiUrl = "https://formbro.com",
  className,
  fallback = null,
  publicId,
  revalidate = 60,
  successMessage,
}: FormBroFormProps) {
  const result = await fetchPublishedFormSnapshot({ apiUrl, publicId, revalidate });

  if (!result.ok) {
    return fallback;
  }

  return (
    <NativeForm
      apiUrl={apiUrl}
      className={className}
      snapshot={result.snapshot}
      successMessage={successMessage}
    />
  );
}
