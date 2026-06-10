import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "cyan" | "blue" | "magenta" | "lime";
const tones: Record<Tone, string> = {
  default: "border-white/10 bg-white/5 text-slate-300",
  cyan: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
  blue: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
  magenta: "border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta",
  lime: "border-neon-lime/30 bg-neon-lime/10 text-neon-lime",
};

export function Badge({
  className,
  tone = "default",
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
