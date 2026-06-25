"use client";

import { initials } from "@formbro/shared/names";
import { Avatar, AvatarFallback, AvatarImage } from "@formbro/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@formbro/ui/dropdown-menu";
import { RiHomeLine, RiLogoutBoxLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeIcon, useToggleTheme } from "@/components/theme";
import { signOut } from "@/lib/auth/client";
import { resetAnalytics } from "@/lib/posthog";
import { useDashboardPrewarmIntent } from "./(dashboard)/_data-provider";

type User =
  | {
      name: string;
      email: string;
      image?: string;
    }
  | null
  | undefined;

function UserAvatar({ user }: { user?: User }) {
  return (
    <Avatar className={`size-9 text-sm font-medium ${user?.image ? "border-0" : "border"}`}>
      {user?.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback>{user ? initials(user.name ?? "Unknown") : null}</AvatarFallback>
    </Avatar>
  );
}

export function AccountMenu({ user }: { user: User }) {
  const router = useRouter();
  const { isDark, toggle } = useToggleTheme();
  const dashboardPrewarmIntent = useDashboardPrewarmIntent();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-68 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="py-2 font-normal">
          <div className="flex items-center gap-2 text-left text-sm">
            <UserAvatar user={user} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link className="flex items-center gap-2" {...dashboardPrewarmIntent}>
              <RiHomeLine />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggle}>
            <ThemeIcon />
            {isDark ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            resetAnalytics();
            await signOut();
            router.replace("/sign-in");
          }}
          variant="destructive"
        >
          <RiLogoutBoxLine />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
