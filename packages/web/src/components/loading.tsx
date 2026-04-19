export function Loading() {
  return (
    <div className="absolute inset-0 -z-50 flex min-h-dvh items-center justify-center">
      <p className="font-mono text-sm tracking-wider text-muted-foreground uppercase">Loading...</p>
    </div>
  );
}
