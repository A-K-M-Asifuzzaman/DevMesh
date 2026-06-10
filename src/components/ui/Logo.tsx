import { cn } from "@/lib/utils";

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-neon-grad shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-950" fill="none" stroke="currentColor" strokeWidth={2.4}>
          <circle cx="5" cy="6" r="2.2" /><circle cx="19" cy="6" r="2.2" />
          <circle cx="12" cy="18" r="2.2" />
          <path d="M6.8 7.6 10.6 16M17.2 7.6 13.4 16M7 6h10" strokeLinecap="round" />
        </svg>
      </span>
      {withWord && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Dev<span className="text-grad">Mesh</span>
        </span>
      )}
    </div>
  );
}
