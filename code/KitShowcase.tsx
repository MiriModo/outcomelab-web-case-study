"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { home, kit } from "@/content/site";
import s from "./KitShowcase.module.css";

/** Height of the sticky site header (Nav.tsx, h-[4.5rem]). */
const HEADER = 72;
/** Degrees between neighbouring cards on the orbit. */
const STEP = 360 / kit.steps.length;
/**
 * How much of the remaining distance the orbit covers in each 1/60 s
 * while it follows the scroll. This way it glides after each wheel step
 * instead of jumping. It uses the real frame time, so it feels the same
 * on 60Hz and 120Hz screens.
 */
const FOLLOW = 0.14;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Turns the scroll position (in steps) into the orbit position. Each card
 * stays in front for a moment, then the orbit turns to the next one with
 * a soft sine ease.
 */
const dwell = (x: number) => {
  const i = Math.floor(x);
  const t = clamp((x - i - 0.15) / 0.7);
  return i + (1 - Math.cos(Math.PI * t)) / 2;
};

/**
 * Where card `k` sits when the orbit is at `pos`: its point on the ellipse
 * (x and y as parts of the radius, y is 1 at the front), its scale and
 * z-index (the front card is full size and on top) and its opacity. The
 * opacity never goes under 86%, so even the card at the back keeps 4.5:1
 * contrast for its grey text.
 */
function place(k: number, pos: number) {
  const rad = ((STEP * (pos - k)) * Math.PI) / 180;
  const front = (Math.cos(rad) + 1) / 2; // 1 in front, 0 at the back
  return {
    x: Math.sin(rad),
    y: Math.cos(rad),
    scale: 0.78 + 0.22 * front,
    z: 1 + Math.round(front * 10),
    opacity: 0.86 + 0.14 * front,
  };
}

const vars = (v: ReturnType<typeof place>) =>
  ({
    "--x": v.x.toFixed(4),
    "--y": v.y.toFixed(4),
    "--s": v.scale.toFixed(4),
    "--z": String(v.z),
    "--o": v.opacity.toFixed(3),
  }) as CSSProperties;

/**
 * Section 5 of the home page: the five steps as cards orbiting the Outcome
 * Kit, seen a bit from above. The orbit turns with the scroll, not on its
 * own. The section stays pinned under the header while you scroll through
 * it, each step comes to the front and stays there for a moment, then the
 * page moves on. A row of step markers under it shows the current step.
 *
 * On phones (under 768px) it's a carousel instead: one card at a time,
 * swiped, with snapping. With prefers-reduced-motion the cards are a
 * simple grid.
 */
export function KitShowcase({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scene.current;
    const ol = list.current;
    if (!el || !ol) return;
    const cards = [...ol.children] as HTMLElement[];
    const last = cards.length - 1;
    const wide = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    /** Where the scroll says the orbit should be, and where it is now. */
    let target = 0;
    let current: number | null = null;
    let lastFrame = 0;

    const draw = (pos: number) => {
      cards.forEach((card, k) => {
        for (const [name, value] of Object.entries(vars(place(k, pos)))) card.style.setProperty(name, value);
      });
      setActive(Math.round(pos));
    };

    const update = () => {
      raf = 0;
      if (!wide.matches) {
        // Carousel: the current card is the one snapped into view.
        const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
        setActive(Math.round(clamp(ol.scrollLeft / step, 0, last)));
        current = null;
        return;
      }
      if (reduce.matches) return;
      // Progress through the pinned part, from the scene reaching the header until the pin lets go.
      const rect = el.getBoundingClientRect();
      const travel = rect.height - (pin.current?.offsetHeight ?? 0);
      const p = travel > 0 ? clamp((HEADER - rect.top) / travel) : 0;
      target = dwell(clamp(p * (last + 0.5) - 0.25, 0, last));
      // Move towards the target a bit each frame. When it's close enough, snap to it and stop asking for frames.
      const now = performance.now();
      const frames = lastFrame ? Math.min(4, (now - lastFrame) / (1000 / 60)) : 1;
      lastFrame = now;
      const follow = 1 - Math.pow(1 - FOLLOW, frames);
      current = current === null ? target : current + (target - current) * follow;
      if (Math.abs(target - current) < 0.0005) current = target;
      draw(current);
      if (current !== target) raf = requestAnimationFrame(update);
      else lastFrame = 0;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    ol.addEventListener("scroll", schedule, { passive: true });
    wide.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ol.removeEventListener("scroll", schedule);
      wide.removeEventListener("change", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={scene} className={s.scene}>
      <div ref={pin} className={s.pin}>
        <div className={s.layout}>
          <div>{children}</div>
          <div>
            <div className={s.stage}>
              <div className={s.world}>
                <div className={s.track} aria-hidden="true" />
                <div className={s.center} aria-hidden="true">
                  <span className={s.centerTitle}>{kit.wheelTitle}</span>
                  <span className={s.centerSubtitle}>{kit.wheelSubtitle}</span>
                </div>
                <ol
                  ref={list}
                  className={s.cards}
                  aria-label={kit.wheelSubtitle}
                >
                  {kit.steps.map((step, index) => (
                    <li
                      key={step.id}
                      className={s.card}
                      data-active={index === active}
                      aria-current={index === active ? "step" : undefined}
                      style={vars(place(index, 0))}
                    >
                      <Link
                        href={`/outcome-kit#${step.id}`}
                        className={s.cardLink}
                      >
                        <span className={s.number}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className={s.title}>{step.name}</h3>
                        <p className={s.description}>
                          {home.kit.orbitDescriptions[index]}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <ol className={s.markers} aria-hidden="true">
              {kit.steps.map((step, index) => (
                <li
                  key={step.id}
                  data-active={index === active}
                  data-done={index < active}
                >
                  <span className={s.markerNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={s.markerName}>{step.name}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
