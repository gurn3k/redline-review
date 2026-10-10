import Link from "next/link";

// Same artwork as app/icon.svg, inlined so the header mark and the favicon
// stay one drawing. "inverse" swaps the two colors for use on the oxblood
// footer.
export function Wordmark({
  href,
  tone = "brand",
}: {
  href: string;
  tone?: "brand" | "inverse";
}) {
  const [tile, letter] =
    tone === "inverse" ? ["#fffdf9", "#8f1d22"] : ["#8f1d22", "#fffdf9"];
  return (
    <Link href={href} className="wordmark">
      <svg
        className="wordmark-mark"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill={tile} />
        <path
          fill={letter}
          fillRule="evenodd"
          d="M8 6.5H17.5A5.75 5.75 0 0 1 17.5 18H14V25.5H8ZM14 11V13.5H17A1.25 1.25 0 0 0 17 11Z"
        />
        <path fill={letter} d="M15.5 16.5H21.5L25 25.5H18.5Z" />
      </svg>
      Redline
    </Link>
  );
}
