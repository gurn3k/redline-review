type Tier = "Dangerous" | "Unusual" | "Clear";

export function SeverityChip({ tier }: { tier: Tier }) {
  return <span className={`chip chip-${tier.toLowerCase()}`}>{tier}</span>;
}
