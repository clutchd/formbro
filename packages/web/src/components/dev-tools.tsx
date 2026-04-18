"use client";

import { Badge } from "@formbro/ui/badge";
import { Switch } from "@formbro/ui/switch";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function InternalCurrentRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(
      `${window.location.protocol}//${window.location.host}${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`,
    );
  }, [pathname, searchParams]);

  return <Badge>{url}</Badge>;
}

export function CurrentRoute() {
  return (
    <Suspense>
      <InternalCurrentRoute />
    </Suspense>
  );
}

function ScreenSize() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { width, height } = dimensions;

  return (
    <Badge className="gap-2">
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
    <div className="fixed right-1 bottom-16 z-50 flex flex-col items-end gap-1">
      {isOpen && <CurrentRoute />}
      {isOpen && <ScreenSize />}
      <Badge className="gap-2">
        Dev Tools
        <Switch
          checked={isOpen}
          onCheckedChange={setIsOpen}
          className="border-primary-foreground/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary-foreground/50"
        />
      </Badge>
    </div>
  );
}
