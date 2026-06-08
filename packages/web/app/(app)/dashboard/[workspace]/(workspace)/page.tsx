"use client";

import { RiFileAiLine } from "@remixicon/react";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { CreateForm } from "../create-form-form";
import { useWorkspaceData } from "../data-provider";

export default function FormsDashboardContent() {
  const { forms } = useWorkspaceData();

  if (!forms) {
    return <Loading title="forms" />;
  }

  if (forms.length === 0) {
    return (
      <PageState
        icon={<RiFileAiLine />}
        title="No forms yet"
        description="Create your first form to start collecting data"
      >
        <CreateForm />
      </PageState>
    );
  }

  return <Page>Forms Here</Page>;
}
