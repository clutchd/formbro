import { FormSubmissionsDataProvider } from "./_data-provider";

export default function FormSubmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FormSubmissionsDataProvider>{children}</FormSubmissionsDataProvider>
    </>
  );
}
