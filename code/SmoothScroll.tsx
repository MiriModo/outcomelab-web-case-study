"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const HEADER_OFFSET = 0; // sections carry scroll-margin-top for the sticky nav

/**
 * Smooth scrolling with Lenis (lenis.dev). Mouse wheel and keyboard scroll
 * are smoothed, touch stays native. Anchor links on the same page (nav, hero
 * button, "keep going") also scroll through Lenis, so the sections slide in
 * instead of jumping. With prefers-reduced-motion it's turned off and the
 * browser's normal scroll is used.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const isFirstRender = useRef(true);
  const isHistoryNavigation = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
        return;
      }
      let target: Element | null = null;
      try {
        target = document.querySelector(url.hash);
      } catch {
        return;
      }
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET, duration: 1.1 });
      window.history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      isHistoryNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Next keeps the scroll position when part of the new page is already in view,
  // so if you leave a long page near the end you land on the next page's footer.
  // This goes back to the top on every route change, but not on back/forward
  // or when the link has a #hash.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }
    if (window.location.hash) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
