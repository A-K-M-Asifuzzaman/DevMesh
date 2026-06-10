/** Layered atmosphere: animated aurora blobs + faint grid + grain.
 *  Purely decorative, fixed behind content. */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain">
      {/* grid */}
      <div
        className="absolute inset-0 bg-grid opacity-60"
        style={{
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black 30%, transparent 75%)",
        }}
      />
      {/* aurora blobs */}
      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] animate-aurora rounded-full bg-neon-blue/20 blur-[120px]" />
      <div
        className="absolute -right-40 top-20 h-[34rem] w-[34rem] animate-aurora rounded-full bg-neon-cyan/20 blur-[120px]"
        style={{ animationDelay: "-8s", animationDuration: "34s" }}
      />
      <div
        className="absolute left-1/3 top-1/2 h-[28rem] w-[28rem] animate-aurora rounded-full bg-neon-magenta/10 blur-[120px]"
        style={{ animationDelay: "-16s" }}
      />
    </div>
  );
}
