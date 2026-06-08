"use client";

import { RiFileAiLine } from "@remixicon/react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { CreateForm } from "../create-form-form";
import { useWorkspaceData } from "../data-provider";

export default function FormsDashboardContent() {
  const { isFormsLoading } = useWorkspaceData();

  if (isFormsLoading) {
    return <Loading title="forms" />;
  }

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
