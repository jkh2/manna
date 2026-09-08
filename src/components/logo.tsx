import { cn } from "@/lib/utils";

export function MannaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-clay", className)}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="18.5" rx="9.5" ry="5.2" fill="currentColor" opacity="0.22" />
      <ellipse cx="16" cy="15" rx="8.2" ry="4.4" fill="currentColor" opacity="0.45" />
      <ellipse cx="16" cy="11.8" rx="6.8" ry="3.6" fill="currentColor" />
    </svg>
  );
}

export function MannaWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MannaMark className="size-7" />
      <span className="font-display text-xl font-medium tracking-tight text-ink">
        Manna
      </span>
    </span>
  );
}
