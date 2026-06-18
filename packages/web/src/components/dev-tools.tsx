"use client";

import { Badge } from "@formbro/ui/badge";
import { Switch } from "@formbro/ui/switch";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";

type Dimensions = {
  width: number;
  height: number;
};

function subscribeToWindowResize(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getWindowDimensions(): Dimensions {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width === cachedWidth && height === cachedHeight) {
    return cachedDimensions;
  }

  cachedWidth = width;
  cachedHeight = height;
  cachedDimensions = { width, height };
  return cachedDimensions;
}

const serverDimensions: Dimensions = { width: 0, height: 0 };
let cachedDimensions = serverDimensions;
let cachedWidth = 0;
let cachedHeight = 0;

function InternalCurrentRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(
      `${window.location.protocol}//${window.location.host}${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`,
    );
  }, [pathname, searchParams]);

  return <Badge className="pointer-events-auto!">{url}</Badge>;
}

function CurrentRoute() {
  return (
    <Suspense>
      <InternalCurrentRoute />
    </Suspense>
  );
}

function ScreenSize() {
  const dimensions = useSyncExternalStore(
    subscribeToWindowResize,
    getWindowDimensions,
    () => serverDimensions,
  );
  const { width, height } = dimensions;

  return (
    <Badge className="pointer-events-auto! gap-2">
      <span>
        {width.toLocaleString()} x {height.toLocaleString()}
      </span>
      <div className="h-3 w-px bg-primary-foreground/25" />
      <span>
        <span className="sm:hidden">XS</span>
        <span className="hidden sm:max-md:inline">SM</span>
        <span className="hidden md:max-lg:inline">MD</span>
        <span className="hidden lg:max-xl:inline">LG</span>
        <span className="hidden xl:max-2xl:inline">XL</span>
        <span className="max-2xl:hidden">2XL</span>
      </span>
    </Badge>
  );
}

export function DevTools() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="pointer-events-none fixed right-1 bottom-16 z-50 flex flex-col items-end gap-1">
      {isOpen && <CurrentRoute />}
      {isOpen && <ScreenSize />}
      <Badge className="pointer-events-auto! gap-2">
        Dev Tools
        <Switch
          checked={isOpen}
          onCheckedChange={setIsOpen}
          className="cursor-pointer border-primary-foreground/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary-foreground/50"
        />
      </Badge>
    </div>
  );
}
