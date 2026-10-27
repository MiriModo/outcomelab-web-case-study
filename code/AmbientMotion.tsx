"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The looping animations (everything marked with `data-ambient`: the floating
 * cards, the hero computer, the caret) only run while they are on screen.
 * Off screen the element gets `data-offscreen` and globals.css pauses every
 * animation inside it. Before this runs nothing is paused, so the first
 * paint is never held back. It's mounted once in the root layout and scans
 * the page again after every navigation.
 */
export function AmbientMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );
    document.querySelectorAll("[data-ambient]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
