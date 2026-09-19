import type { Metadata } from "next";
import { DocumentIntakeCard } from "./document-intake-card";
import { RedLinesRegisterCard } from "./red-lines-register-card";
import { LibraryRegisterCard } from "./library-register-card";

export const metadata: Metadata = {
  title: "Home — Redline",
};

// Per .impeccable/surfaces/app-shell.md: the authenticated home is a
// document intake surface (paste or upload) foregrounded, with red lines and
// the library reachable as clearly labeled adjacent registers. Each card is
// its own component (see ./document-intake-card.tsx, ./red-lines-register-card.tsx,
// ./library-register-card.tsx) so the tickets that build them (02, 03, 11)
// can each own one file without touching this layout or each other's work.
export default function HomePage() {
  return (
    <div className="home-shell">
      <DocumentIntakeCard />

      <div className="registers">
        <RedLinesRegisterCard />
        <LibraryRegisterCard />
      </div>
    </div>
  );
}
