"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { SectionLabel } from "./Section";
import { home } from "@/content/site";
import s from "./ModelComparison.module.css";

/**
 * The two consulting models in one list. It starts on "Traditional
 * consulting". Switch to "Outcome Lab" and a thin grey line crosses out
 * each row one after the other, with our answer showing up on its right
 * and a blue tick. Switch back and it goes in reverse. Nothing changes by
 * itself: until the switch is used once, its other side pulses and a hint
 * points at it.
 */
export function ModelComparison({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<0 | 1>(0);
  const [used, setUsed] = useState(false);
  const cardId = useId();
  const { compare } = home.changed;

  const choose = (next: 0 | 1) => {
    setUsed(true);
    setMode(next);
  };

  return (
    <div className={s.layout}>
      <div className={s.context}>
        {children}
        {/* The switch: a dark thumb slides to the chosen side. Until it's used, the other side pulses and a hint points at it. */}
        <div className={s.controls} data-ambient>
          <SectionLabel label={compare.label} />
          <div
            className={s.toggle}
            role="group"
            aria-label="Choose a consulting model"
            data-mode={mode}
            data-hint={!used}
          >
            <span className={s.thumb} aria-hidden="true" />
            {compare.columns.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-pressed={mode === index}
                aria-controls={cardId}
                onClick={() => choose(index as 0 | 1)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className={s.hint} data-hidden={used} aria-hidden={used}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {compare.hint}
          </p>
        </div>
      </div>
      <div id={cardId} className={s.card} data-model={mode === 1 ? "lab" : "traditional"}>
        <div className={s.header}>
          <span>{compare.columns[mode]}</span>
          <span className={s.dot} aria-hidden="true" />
        </div>
        <ul className={s.list} aria-live="polite" aria-label={compare.columns[mode]}>
          {compare.rows.map(([before, after], index) => (
            <li key={before} className={s.item} style={{ "--i": index } as CSSProperties}>
              <span className={s.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className={s.pair}>
                <span className={s.before} aria-hidden={mode === 1}>
                  {before}
                  <span className={s.strike} aria-hidden="true" />
                </span>
                <span className={s.after} aria-hidden={mode === 0}>
                  <span className="sr-only">{before}, replaced by </span>
                  {after}
                </span>
              </span>
              <span className={s.mark} aria-hidden="true">✓</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
