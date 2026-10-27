"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The dotted circle in every section label is also a progress ring. Its
 * twelve dots light up one by one as you scroll through that section (from
 * its top at 75% of the view to its bottom at the same line). It sets --p
 * (0 to 1) on each ring and globals.css turns that into dot opacity. Before
 * this runs every dot is on, like in the logo. Mounted once in the root
 * layout, it scans the page again after every navigation.
 */
export function SectionProgress() {
  const pathname = usePathname();

  useEffect(() => {
    const rings = [...document.querySelectorAll<SVGSVGElement>("[data-section-dots]")]
      .map((ring) => ({ ring, section: ring.closest("section") }))
      .filter((entry): entry is { ring: SVGSVGElement; section: HTMLElement } => entry.section !== null);
    if (!rings.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const { ring, section } of rings) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        ring.style.setProperty("--p", clamp((vh * 0.75 - rect.top) / Math.max(rect.height, 1)).toFixed(3));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
