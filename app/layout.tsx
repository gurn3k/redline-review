import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { Analytics } from "./components/analytics";
import { DisclaimerFooter } from "./components/disclaimer-footer";
import "./globals.css";

// Two voices: a serif for headings and contract text, a sans for the
// interface. No monospace (see DESIGN.md).
const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const title = "Redline: know what you're about to sign";
const description =
  "Contract review for small business owners. Redline flags the risky clauses in a contract before you sign it, each tied to the exact sentence it came from.";

// The link-preview image is app/opengraph-image.png, rendered from
// scripts/share-card.html.
export const metadata: Metadata = {
  metadataBase: new URL("https://redline-review-nine.vercel.app"),
  title,
  description,
  authors: [{ name: "Gurnek Khaira", url: "https://www.gurn3k.com" }],
  openGraph: {
    type: "website",
    siteName: "Redline",
    url: "/",
    title,
    description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body>
        {children}
        <DisclaimerFooter />
        <Analytics />
      </body>
    </html>
  );
}
