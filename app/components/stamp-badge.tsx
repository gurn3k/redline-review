type Tier = "dangerous" | "unusual" | "clear";

const TIER_COLOR: Record<Tier, string> = {
  dangerous: "var(--danger-red)",
  unusual: "var(--unusual-amber)",
  clear: "var(--confirm-green)",
};

export function InkGrainFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="ink-grain" x="-40%" y="-60%" width="180%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8 0.9"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feComponentTransfer in="noise" result="alphaNoise">
            <feFuncA type="linear" slope="0.55" intercept="0.55" />
          </feComponentTransfer>
          <feComposite in="displaced" in2="alphaNoise" operator="in" />
        </filter>

        <filter id="perf-rough" x="-60%" y="-60%" width="220%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <pattern id="perf-v" patternUnits="userSpaceOnUse" width="7" height="13">
          <circle cx="3.5" cy="6.5" r="2.1" fill="var(--rule-line)" filter="url(#perf-rough)" />
        </pattern>
        <pattern id="perf-h" patternUnits="userSpaceOnUse" width="13" height="7">
          <circle cx="6.5" cy="3.5" r="2.1" fill="var(--rule-line)" filter="url(#perf-rough)" />
        </pattern>
      </defs>
    </svg>
  );
}

export function Perforation({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const patternId = orientation === "vertical" ? "perf-v" : "perf-h";
  return (
    <svg
      className={`perforation perforation-${orientation}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function StampBadge({
  tier,
  label,
  large = false,
}: {
  tier: Tier;
  label: string;
  large?: boolean;
}) {
  return (
    <span className={`stamp-badge stamp-badge-${tier}${large ? " stamp-badge-lg" : ""}`}>
      <svg className="stamp-ink" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
        <rect x="4" y="5" width="112" height="30" rx="3" fill={TIER_COLOR[tier]} filter="url(#ink-grain)" />
      </svg>
      <span className="stamp-label">{label}</span>
    </span>
  );
}
