"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { segmentByCitations } from "@/lib/analysis/highlight";
import { CATEGORY_LABELS, flagTitle } from "@/lib/analysis/labels";
import type { AnalysisResult, ClauseCategory, ClearState, Flag } from "@/lib/analysis/types";
import { SeverityChip } from "./severity-chip";

// Copy in this file has been run through the humanizer skill.

// The analysis view: flags on one side, the contract on the other, with
// every cited sentence highlighted in place. Selecting a flag marks its
// sentence and scrolls the contract to it; selecting a highlight selects
// its flag. Shared by /documents/[id], /sample and the landing page, so the
// public sample can never look different from the real product.
export function AnalysisWorkspace({
  documentText,
  result,
  showRedLinesLink = true,
}: {
  documentText: string;
  result: AnalysisResult;
  showRedLinesLink?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(result.flags.length > 0 ? 0 : null);
  const markRefs = useRef<Record<number, HTMLElement | null>>({});
  const flagRefs = useRef<Record<number, HTMLElement | null>>({});

  const segments = useMemo(
    () => segmentByCitations(documentText, result.flags.map((flag) => flag.citation)),
    [documentText, result.flags],
  );

  function selectFlag(index: number) {
    setSelected(index);
    markRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function selectFromDocument(index: number) {
    setSelected(index);
    flagRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="workspace">
      <div className="flag-column">
        {result.clear ? (
          <ClearBlock clear={result.clear} showRedLinesLink={showRedLinesLink} />
        ) : (
          <ol className="flag-list">
            {result.flags.map((flag, index) => (
              <li
                key={`${flag.category}-${index}`}
                ref={(el) => {
                  flagRefs.current[index] = el;
                }}
              >
                <FlagItem
                  flag={flag}
                  open={selected === index}
                  onSelect={() => selectFlag(index)}
                />
              </li>
            ))}
          </ol>
        )}
      </div>

      <article className="doc-paper" aria-label="The contract">
        <p className="doc-label">The contract</p>
        <div className="doc-text">
          {segments.map((segment, i) => {
            if (segment.flagIndexes.length === 0) return <span key={i}>{segment.text}</span>;
            const first = segment.flagIndexes[0];
            const tier = result.flags[first].severity === "Dangerous" ? "dangerous" : "unusual";
            const isSelected = selected !== null && segment.flagIndexes.includes(selected);
            return (
              <mark
                key={i}
                ref={(el) => {
                  for (const index of segment.flagIndexes) {
                    if (!markRefs.current[index]) markRefs.current[index] = el;
                  }
                }}
                className={`hl hl-${tier}${isSelected ? " hl-selected" : ""}`}
                onClick={() => selectFromDocument(first)}
                title={flagTitle(result.flags[first])}
              >
                {segment.text}
              </mark>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function FlagItem({ flag, open, onSelect }: { flag: Flag; open: boolean; onSelect: () => void }) {
  const [copied, setCopied] = useState(false);
  const hasCounter = flag.counterOffer.trim().length > 0;

  async function copyCounter() {
    try {
      await navigator.clipboard.writeText(flag.counterOffer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`flag flag-${flag.severity.toLowerCase()}${open ? " flag-open" : ""}`}>
      <button type="button" className="flag-head" onClick={onSelect} aria-expanded={open}>
        <SeverityChip tier={flag.severity} />
        <span className="flag-title">{flagTitle(flag)}</span>
        {flag.redLineText ? <span className="flag-redline">&ldquo;{flag.redLineText}&rdquo;</span> : null}
      </button>

      {open ? (
        <div className="flag-body">
          <blockquote className="flag-quote">{flag.citation}</blockquote>
          <p className="flag-explanation">{flag.explanation}</p>
          {hasCounter ? (
            <div className="counter">
              <div className="counter-head">
                <span className="counter-label">Language you could propose</span>
                <button type="button" className="text-button" onClick={copyCounter}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="counter-text">{flag.counterOffer}</p>
            </div>
          ) : null}
          <button type="button" className="text-button show-in-doc" onClick={onSelect}>
            Show in contract ↓
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ClearBlock({ clear, showRedLinesLink }: { clear: ClearState; showRedLinesLink: boolean }) {
  const hasCategories = clear.checkedStandardCategories.length > 0;
  const hasRedLines = clear.checkedRedLines.length > 0;

  return (
    <div className="clear-block">
      <SeverityChip tier="Clear" />
      <p className="clear-headline">
        Nothing in this contract cleared the bar for a Dangerous or Unusual flag.
      </p>
      {hasCategories ? (
        <>
          <p className="list-label">Standard checks run</p>
          <ul className="check-list">
            {clear.checkedStandardCategories.map((category) => (
              <li key={category}>{CATEGORY_LABELS[category as Exclude<ClauseCategory, "red-line">]}</li>
            ))}
          </ul>
        </>
      ) : null}
      {hasRedLines ? (
        <>
          <p className="list-label">Your red lines checked</p>
          <ul className="check-list">
            {clear.checkedRedLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </>
      ) : showRedLinesLink ? (
        <p className="muted-note">
          You haven&rsquo;t added any red lines, so none were checked.{" "}
          <Link href="/red-lines">Add a red line</Link>
        </p>
      ) : null}
    </div>
  );
}
