"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cx } from "@/lib/cx";

type Tag = "div" | "li" | "p" | "figure" | "article" | "span";
type Variant = "fade" | "line" | "custom";

const VARIANT_CLASS: Record<Variant, string> = {
  fade: "reveal-fade",
  line: "reveal-line",
  custom: "reveal-custom",
};

/**
 * Content below the fold fades in when you scroll to it. It is hidden only
 * after the component mounts, and anything already on screen at that point
 * is left alone. So the hero and the first screen never animate, and the
 * text is readable even without JavaScript.
 *
 * variant "fade": opacity and a 14px rise. variant "line": the child with
 * class "line" draws in from the left. variant "custom": the wrapper stays
 * visible and its children with "portrait" or "fade-in" animate themselves.
 */
export function Reveal({
  as = "div",
  variant = "fade",
  step = 0,
  className,
  children,
}: {
  as?: Tag;
  variant?: Variant;
  /** How many stagger gaps (--motion-stagger) to wait before arriving. */
  step?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = { "--reveal-delay": `calc(var(--motion-stagger) * ${step})` } as CSSProperties;
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement | null>}
      className={cx("reveal", VARIANT_CLASS[variant], className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
