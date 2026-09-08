import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "clay" | "sage" | "mute";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tone === "default" && "bg-sunken text-ink",
        tone === "clay" && "bg-clay text-clay-fg",
        tone === "sage" && "bg-sage/15 text-sage",
        tone === "mute" && "bg-transparent text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
