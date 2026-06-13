/** Pure matte black atmosphere.
 *  No animated blobs — just a very faint dot grid and a single top-edge glow hint. */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Faint dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%)",
        }}
      />
      {/* Single top-edge glow — barely visible cyan depth hint */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: "40vh",
          background:
            "radial-gradient(ellipse 70% 100% at 50% -20%, rgba(0,217,255,0.05) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
