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
    <Avatar className="size-8 border text-sm font-medium">
      {user?.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback>{user ? initials(user.name ?? "Unknown") : null}</AvatarFallback>
    </Avatar>
  );
}

export function AccountMenu({ user }: { user: User }) {
  const router = useRouter();
  const { isDark, toggle } = useToggleTheme();

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
            <Link className="flex items-center gap-2" href="/dashboard">
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
          onClick={() => {
            signOut();
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
