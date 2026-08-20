import { SidebarContent, SidebarMenu, SidebarMenuButton } from "@formbro/ui/sidebar";
import { RiFileAiLine, RiInboxLine, RiSettings2Line, RiShareLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequiredWorkspaceFormData } from "./_data-provider";
import { useFormSubmissionsPrewarmIntent } from "./submissions/_data-provider";

export function FormSidebar() {
  const pathname = usePathname();
  const { form, workspace } = useRequiredWorkspaceFormData();
  const workspaceSlug = workspace.slug;
  const formSlug = form.slug;
  const formPath = `/dashboard/${workspaceSlug}/${formSlug}`;
  const submissionsPrewarm = useFormSubmissionsPrewarmIntent(workspaceSlug, formSlug);

  return (
    <>
      <SidebarContent className="gap-2 p-2">
        <SidebarMenu>
          <SidebarMenuButton
            asChild
            className="data-[active=true]:bg-accent"
            isActive={pathname === formPath}
          >
            <Link prefetch href={formPath}>
              <RiFileAiLine /> Editor
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="data-[active=true]:bg-accent"
            isActive={
              pathname === `${formPath}/submissions` ||
              pathname.startsWith(`${formPath}/submissions/`)
            }
          >
            <Link {...submissionsPrewarm}>
              <RiInboxLine /> Submissions
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="data-[active=true]:bg-accent"
            isActive={pathname === `${formPath}/share`}
          >
            <Link prefetch href={`${formPath}/share`}>
              <RiShareLine /> Share
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="data-[active=true]:bg-accent"
            isActive={pathname === `${formPath}/settings`}
          >
            <Link prefetch href={`${formPath}/settings`}>
              <RiSettings2Line /> Settings
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
