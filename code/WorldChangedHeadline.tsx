'use client';

/**
 * The headline in section 2. "evolving" pulses from black to blue, and
 * "change" scrolls through random characters and lands letter by letter,
 * a bit like a slot machine.
 *
 * The scramble starts when the headline scrolls into view and plays once
 * every time it comes in. With `loop` it keeps replaying while visible.
 *
 *   <WorldChangedHeadline />
 *   <WorldChangedHeadline loop settle={3} />
 */

import { useEffect, useRef, useState } from 'react';
import s from './WorldChangedHeadline.module.css';

const TARGET = 'change';
const POOL = 'abcdefghijklmnopqrstuvwxyz#%&@$?*<>/{}[]=+0123456789';
const LINE = 1.08; // reel row height in em, matches the CSS

function makeStrips() {
  return TARGET.split('').map((ch, i) => {
    const n = 14 + i * 4;
    const g: string[] = [];
    for (let k = 0; k < n - 1; k++) g.push(POOL[Math.floor(Math.random() * POOL.length)]);
    g.push(ch);
    return g;
  });
}

type Props = {
  /** Seconds until the last letter lands (default 2.6). */
  settle?: number;
  /** Keep replaying while visible (hold 4.5 s between runs). */
  loop?: boolean;
  className?: string;
  id?: string;
};

export default function WorldChangedHeadline({ settle = 2.6, loop = false, className, id }: Props) {
  const root = useRef<HTMLHeadingElement>(null);
  const reels = useRef<(HTMLSpanElement | null)[]>([]);
  // the server render and the first paint show the plain word, the random strips only exist in the browser
  const [strips, setStrips] = useState<string[][]>(() => TARGET.split('').map((c) => [c]));

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let current: string[][] = [];

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
      raf = 0;
      hold = undefined;
    };

    const run = () => {
      stop();
      current = makeStrips();
      setStrips(current);
      const n = current.length;
      let t0 = 0;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = (now - t0) / 1000;
        let done = true;
        current.forEach((g, i) => {
          const reel = reels.current[i];
          if (!reel) return;
          // first letter lands at ~45% of `settle`, the last at 100%
          const land = settle * (0.45 + 0.55 * (n > 1 ? i / (n - 1) : 1));
          const p = Math.min(1, t / land);
          if (p < 1) done = false;
          const eased = 1 - Math.pow(1 - p, 3);
          reel.style.transform = `translateY(-${(eased * (g.length - 1) * LINE).toFixed(3)}em)`;
          reel.dataset.landed = p >= 1 ? '1' : '0';
        });
        if (!done) {
          raf = requestAnimationFrame(frame);
        } else {
          raf = 0;
          if (loop && visible) hold = setTimeout(run, 4500);
        }
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
        if (visible && !was) {
          el.dataset.pulse = "on";
          run();
        }
        if (!visible) stop();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [settle, loop]);

  return (
    <h2 id={id} ref={root} data-ambient className={`${s.headline} ${className ?? ''}`}>
      <span className={`${s.line} ${s.f1}`}>
        The tech ecosystem is <span className={s.pulse}>evolving</span>.
      </span>
      <span className={`${s.line} ${s.f2}`}>
        Consulting needs to{' '}
        <span className={s.srOnly}>change</span>
        <span className={s.word} aria-hidden="true">
          {strips.map((g, i) => (
            <span className={s.col} key={i}>
              <span className={s.sp}>{TARGET[i]}</span>
              <span
                className={s.reel}
                ref={(node) => {
                  reels.current[i] = node;
                }}
              >
                {g.map((ch, k) => (
                  <span className={s.g} key={k}>{ch}</span>
                ))}
              </span>
            </span>
          ))}
        </span>{' '}
        with it.
      </span>
    </h2>
  );
}
