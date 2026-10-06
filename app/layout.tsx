import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Redline — know what you're about to sign",
  description:
    "Contract review for small business owners. Redline flags the risky clauses in a contract before you sign it, each tied to the exact sentence it came from.",
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
      </body>
    </html>
  );
}
