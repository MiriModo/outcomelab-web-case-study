"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { AboutIntro } from "./AboutIntro";
import { Container } from "./Container";
import { ComputerDrawing, DRAWING, SCREEN } from "./HeroComputer";
import { HeroPanelContent } from "./HeroPanel";
import { STAT_CARD, STAT_GRID, StatCardBody } from "./StatCards";
import { home } from "@/content/site";
import s from "./LaptopScrollHero.module.css";

/**
 * The home hero on screens from 1024px up. It is driven by the scroll.
 * The computer drawing sits over the dark panel and grows as you scroll,
 * until its screen covers the whole view under the header. The screen
 * content moves with the scroll too: the cursor signs the contract, the
 * line climbs from baseline to target and "Target met" shows up right
 * when the screen fills the view. Then a white gradient goes down over
 * the screen and the next section (the intro) comes in behind it.
 *
 * The drawing is never scaled like an image. On every frame it is laid
 * out again at the size it is shown (CSS zoom) and only moved, so the
 * text stays sharp from the start to the end.
 *
 * With prefers-reduced-motion it just jumps from the start state to the
 * end state halfway through.
 */

/** Height of the sticky site header (Nav.tsx, h-[4.5rem]). */
const HEADER = 72;
/** Scroll length of the effect, in viewport heights. */
const LENGTH = 2.6;
/** Where the display's top edge starts, as a share of the viewport height. */
const LID_TOP = 0.33;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The part of the scroll where the white gradient goes down over the screen. */
const DISSOLVE = [0.5, 0.67] as const;
/**
 * How far the screen's 10s loop is at the start, and the point where
 * "Target met" has landed (81% of the loop). We reach it right when the
 * gradient starts. After that it stays there, so the loop never resets.
 */
const STORY = { from: 0.04, to: 0.82, end: DISSOLVE[0] } as const;
/** Let the intro go as soon as it has come in, so there is no dead scroll after it. */
const INTRO_END = DISSOLVE[1] + 0.1;

/**
 * Size of the computer at rest, with room left under it for the shadow
 * and the captions. Between 1024px and 1280px it starts a bit smaller so
 * it doesn't touch the two numbers on its sides.
 */
const startScale = (w: number) => Math.min(0.78, (w / 1440) * lerp(0.6, 0.7, clamp((w - 1024) / 256)));
/** Minimum gap between the headline and the top of the display. */
const LID_GAP = 14;
/** The size at which the screen just covers the view. */
const endScale = (w: number, h: number) => Math.max(w / SCREEN.width, h / SCREEN.height) * 1.01;

export function LaptopScrollHero({ className }: { className?: string }) {
  const track = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLDivElement>(null);
  const nextContent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      const t = track.current;
      const st = sticky.current;
      const r = rig.current;
      if (!t || !st || !r || st.clientWidth === 0) return;

      const w = st.clientWidth;
      const h = st.clientHeight;
      // At rest the top of the display is at LID_TOP of the view, or just under
      // the headline if the view is short. offsetTop ignores the panel's transform.
      const pn = panel.current;
      const title = pn?.querySelector<HTMLElement>("h1");
      let titleBottom = 0;
      if (pn && title) {
        // Add up the offsets until the panel, the headline's offsetParent is a wrapper inside it.
        let y = title.offsetHeight;
        for (let el: HTMLElement | null = title; el && el !== pn; el = el.offsetParent as HTMLElement | null) y += el.offsetTop;
        titleBottom = pn.offsetTop + y;
      }
      const lidTop = Math.max(LID_TOP * h, titleBottom + LID_GAP);
      // If the cards below are taller than the view, add extra scroll after the
      // hero so all of them can still be reached on a short laptop screen.
      const overflow = Math.max(0, (nextContent.current?.scrollHeight ?? 0) - h);
      const total = window.innerHeight * LENGTH + HEADER;
      const transitionEnd = total * (reduce ? 0.5 : INTRO_END);
      const trackHeight = h + transitionEnd + overflow;
      const height = `${trackHeight}px`;
      if (t.style.height !== height) t.style.height = height;
      const rect = t.getBoundingClientRect();
      const distance = HEADER - rect.top;
      const contentScroll = clamp(distance - transitionEnd, 0, overflow);
      let p = clamp(distance / total);
      if (reduce) p = p < 0.5 ? 0 : 1;

      // The zoom finishes while the intro comes in, then the content scrolls normally.
      // At the start the top of the display is at lidTop, at the end the screen
      // is centred and just covers the view.
      const e = easeInOut(clamp(p / INTRO_END));
      const s0 = startScale(w);
      const size = lerp(s0, endScale(w, h), e);
      // Lay out the drawing at the size it is shown and only move it, never scale it as a bitmap.
      const zoom = size.toFixed(4);
      if (r.style.getPropertyValue("--lsh-z") !== zoom) r.style.setProperty("--lsh-z", zoom);
      const ty = Math.round(lerp(SCREEN.centerY * s0 - (h / 2 - lidTop), 0, e));
      r.style.transform = `translate(0, ${ty}px)`;
      r.style.setProperty("--lt-t", lerp(STORY.from, STORY.to, clamp(p / STORY.end)).toFixed(4));

      // The dark panel goes back behind the growing computer. The captions fade out first.
      if (panel.current) {
        const lift = smooth(0, 0.45, p);
        panel.current.style.opacity = String(1 - smooth(0.36, 0.5, p));
        panel.current.style.transform = `translate3d(0, ${(-h * 0.06 * lift).toFixed(2)}px, 0) scale(${(1 - 0.04 * lift).toFixed(4)})`;
        // The two numbers fade out before the computer reaches them. This is set on
        // each number, because the hero-rise animation keeps their row at full opacity.
        const stats = panel.current.querySelector<HTMLElement>("[data-hero-stats]");
        const statsOpacity = String(1 - smooth(0.06, 0.2, p));
        stats?.querySelectorAll<HTMLElement>(":scope > *").forEach((stat) => (stat.style.opacity = statsOpacity));
      }
      if (footer.current) {
        const gone = smooth(0.04, 0.2, p);
        footer.current.style.opacity = String(1 - gone);
        footer.current.style.visibility = gone > 0.99 ? "hidden" : "visible";
      }

      // When the screen almost fills the view, a white gradient goes down over it.
      // Only after that does the next section come in, so the two never overlap.
      // At the end its label turns blue.
      const q = clamp((p - DISSOLVE[0]) / (DISSOLVE[1] - DISSOLVE[0]));
      if (veil.current) {
        veil.current.style.setProperty("--lsh-q", q.toFixed(4));
        veil.current.style.visibility = q > 0 ? "visible" : "hidden";
      }
      if (next.current) next.current.style.visibility = q >= 1 ? "visible" : "hidden";
      if (nextContent.current) {
        const show = smooth(DISSOLVE[1], INTRO_END, p);
        nextContent.current.style.opacity = String(show);
        nextContent.current.style.transform = `translate3d(0, ${(-16 * (1 - show) - contentScroll).toFixed(2)}px, 0)`;
        nextContent.current.classList.toggle(s.settled, show > 0.9);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(onScroll);
    if (nextContent.current) observer.observe(nextContent.current);
    // The headline can change size when its font loads, and the start position depends on it.
    const headline = panel.current?.querySelector("h1");
    if (headline) observer.observe(headline);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const { captions, laptop } = home.hero;
  const vars = {
    height: `calc(${(LENGTH * INTRO_END + 1) * 100}vh - ${HEADER * (1 - INTRO_END)}px)`,
    "--lsh-h": `calc(100vh - ${HEADER}px)`,
    "--lsh-lid-top": LID_TOP,
    "--lsh-cx": `${SCREEN.centerX}px`,
    "--lsh-cy": `${SCREEN.centerY}px`,
    "--lsh-w": `${DRAWING.width}px`,
    "--lsh-dh": `${DRAWING.height}px`,
  } as CSSProperties;

  return (
    <section ref={track} data-ambient aria-labelledby="hero-title-scroll" className={`${s.track} ${className ?? ""}`} style={vars}>
      <div ref={sticky} className={s.sticky} style={{ top: HEADER }}>
        <div ref={panel} className={`${s.panel} hero-panel hero-rise`}>
          <HeroPanelContent headingId="hero-title-scroll" />
        </div>

        <div ref={footer} className={s.footer}>
          <p className="t-body-sm max-w-[21rem] text-muted">{captions[0]}</p>
          <p className="t-body-sm max-w-[21rem] justify-self-end text-right text-muted">{captions[1]}</p>
        </div>

        <div ref={rig} className={s.rig} role="img" aria-label={laptop.label}>
          <div className={s.drawing}>
            <ComputerDrawing float={false} scrub ids="hcs" />
          </div>
        </div>

        <div ref={veil} className={s.veil} aria-hidden="true" />

        {/* A visual copy of the intro. The real one comes after the hero, for screen readers. */}
        <div ref={next} className={s.next} aria-hidden="true">
          <Continuation contentRef={nextContent} />
        </div>
      </div>
    </section>
  );
}

/**
 * The intro section, laid out like on the page, starting at the top of the
 * view, with the number cards under the text. Its label ("About Outcome
 * Lab") turns blue once the heading is in.
 */
function Continuation({ contentRef }: { contentRef: RefObject<HTMLDivElement | null> }) {
  const { stats } = home;
  return (
    <div className="size-full bg-paper">
      <div ref={contentRef} className="opacity-0">
        <Container className="pt-12 pb-10">
          <AboutIntro labelClassName={s.label} />
          <ul data-ambient className={`${STAT_GRID} mt-10`}>
            {stats.map((stat) => (
              <li key={stat.value} className={STAT_CARD}>
                <StatCardBody stat={stat} />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </div>
  );
}
