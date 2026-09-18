"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InkGrainFilter, Perforation, StampBadge } from "./stamp-badge";

type Severity = "dangerous" | "unusual";

type Confirmation = {
  ref: string;
  severity: Severity;
  title: string;
  citation: string;
  counter: string;
  lead?: boolean;
};

const CONFIRMATIONS: Confirmation[] = [
  {
    ref: "§6.3",
    severity: "dangerous",
    title: "Personal guarantee",
    citation:
      "the individual executing this Agreement personally and unconditionally guarantees full payment of all amounts owed — without limitation as to amount or duration",
    counter: "Cap personal liability at a stated amount, or remove the personal guarantee.",
    lead: true,
  },
  {
    ref: "§6.7",
    severity: "dangerous",
    title: "Indemnification",
    citation:
      "Client shall indemnify … against any and all claims … whether or not arising from Vendor's own acts or omissions",
    counter: "Limit indemnification to claims caused by Client, capped at the contract value.",
  },
  {
    ref: "§9.2",
    severity: "dangerous",
    title: "Termination",
    citation: "Vendor may terminate this Agreement at any time, with or without cause … effective immediately",
    counter: "Add a cause requirement and a cure period before termination.",
  },
  {
    ref: "§4.1",
    severity: "unusual",
    title: "Auto-renewal",
    citation:
      "this Agreement shall automatically renew … Vendor may adjust the Service Fee for each renewal term upon notice",
    counter: "Require 60 days' notice of any fee increase and a longer cancellation window.",
  },
];

const SOURCE_LINES: { ref?: string; text: string }[] = [
  { text: "VENDOR SERVICES AGREEMENT — excerpt" },
  { text: "" },
  { text: "4.1 Term and Renewal. This Agreement shall commence on the" },
  { text: "Effective Date and continue for an initial term of twelve (12)" },
  {
    ref: "§4.1",
    text: "months. Thereafter, this Agreement shall automatically renew for",
  },
  { text: "successive twelve (12) month terms unless either party provides" },
  { text: "written notice of non-renewal at least ninety (90) days prior to" },
  { text: "the end of the then-current term. Vendor may adjust the Service" },
  { text: "Fee for each renewal term upon notice." },
  { text: "" },
  {
    ref: "§6.3",
    text: "6.3 Personal Guarantee. By signing below, the individual executing",
  },
  { text: "this Agreement on behalf of Client personally and unconditionally" },
  { text: "guarantees full payment of all amounts owed under this Agreement," },
  { text: "without limitation as to amount or duration, regardless of the" },
  { text: "corporate or business structure of Client." },
  { text: "" },
  {
    ref: "§6.7",
    text: "6.7 Indemnification. Client shall indemnify, defend, and hold",
  },
  { text: "harmless Vendor, its officers, and affiliates from and against" },
  { text: "any and all claims, damages, losses, and expenses of any kind" },
  { text: "whatsoever, whether or not arising from Vendor's own acts or" },
  { text: "omissions." },
  { text: "" },
  { ref: "§9.2", text: "9.2 Termination. Vendor may terminate this Agreement at any time," },
  { text: "with or without cause, upon written notice to Client, effective" },
  { text: "immediately." },
  { text: "" },
  { text: "9.5 Confidentiality. Each party agrees to maintain the" },
  { text: "confidentiality of the other party's proprietary information" },
  { text: "disclosed in connection with this Agreement." },
];

const TIER_STROKE: Record<Severity, string> = {
  dangerous: "var(--danger-red)",
  unusual: "var(--unusual-amber)",
};

type TetherPath = { d: string; stroke: string };

export function HeroLedger() {
  const [tethers, setTethers] = useState<TetherPath[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tapePanelRef = useRef<HTMLDivElement>(null);
  const tapeRefEls = useRef<Record<string, HTMLElement>>({});
  const cardRefEls = useRef<Record<string, HTMLElement>>({});

  const measure = useCallback(() => {
    const container = containerRef.current;
    const tapePanel = tapePanelRef.current;
    if (!container || !tapePanel) return;
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;
    if (!isDesktop) {
      setTethers([]);
      return;
    }
    const containerBox = container.getBoundingClientRect();
    const tapeBox = tapePanel.getBoundingClientRect();
    const next: TetherPath[] = [];
    for (const c of CONFIRMATIONS) {
      const source = tapeRefEls.current[c.ref];
      const card = cardRefEls.current[c.ref];
      if (!source || !card) continue;
      const sBox = source.getBoundingClientRect();
      const cBox = card.getBoundingClientRect();
      // Start at the tape panel's own outer edge (not the ref chip's position
      // inside it) so the line never has to travel under the tape's opaque
      // background — only the chip's height carries which line is cited.
      const x1 = tapeBox.right - containerBox.left;
      const y1 = sBox.top + sBox.height / 2 - containerBox.top;
      const x2 = cBox.left - containerBox.left;
      const y2 = cBox.top + cBox.height / 2 - containerBox.top;
      const midX = x1 + (x2 - x1) / 2;
      next.push({
        d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        stroke: TIER_STROKE[c.severity],
      });
    }
    setTethers(next);
  }, []);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="hero-ledger" ref={containerRef}>
      <InkGrainFilter />

      <svg className="tether-overlay" aria-hidden="true">
        {tethers.map((t, i) => (
          <path key={i} d={t.d} className="tether-path" style={{ stroke: t.stroke }} />
        ))}
      </svg>

      <div className="tape" ref={tapePanelRef} aria-label="Sample contract excerpt, for demonstration">
        <p className="tape-label">Sample contract — not a real filing</p>
        <pre className="tape-body">
          {SOURCE_LINES.map((line, i) => (
            <span key={i} className="tape-line">
              {line.ref ? (
                <span
                  className="tape-ref"
                  ref={(el) => {
                    if (el) tapeRefEls.current[line.ref as string] = el;
                  }}
                >
                  {line.ref}
                </span>
              ) : null}
              {line.text}
              {"\n"}
            </span>
          ))}
        </pre>
        <Perforation orientation="vertical" />
      </div>

      <div className="confirmations">
        {CONFIRMATIONS.map((c, i) => (
          <div
            key={c.ref}
            className={`confirmation ${c.severity} ${c.lead ? "lead" : ""}`}
            style={{ animationDelay: `${i * 140}ms` }}
            ref={(el) => {
              if (el) cardRefEls.current[c.ref] = el;
            }}
          >
            <div className="confirmation-head">
              <StampBadge
                tier={c.severity}
                label={c.severity === "dangerous" ? "DANGEROUS" : "UNUSUAL"}
                large={c.lead}
              />
              <span className="ref tabular">{c.ref}</span>
            </div>
            <p className="confirmation-title">{c.title}</p>
            <p className="confirmation-citation">&ldquo;{c.citation}&rdquo;</p>
            <Perforation orientation="horizontal" />
            <p className="confirmation-counter">
              <span className="counter-label">Proposed edit</span> {c.counter}
            </p>
          </div>
        ))}

        <div className="confirmation clear" style={{ animationDelay: "560ms" }}>
          <div className="confirmation-head">
            <StampBadge tier="clear" label="CLEAR" />
            <span className="ref tabular">§ 9.5 + 3 more</span>
          </div>
          <p className="confirmation-title">
            Checked against the standard clause set — nothing here clears the bar for a flag.
          </p>
        </div>
      </div>
    </div>
  );
}
