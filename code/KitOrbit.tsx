import type { CSSProperties } from "react";
import { kit } from "@/content/site";

/**
 * The orbit in the Outcome Kit page hero: the five D's turning around the
 * title on a tilted ring, in real 3D. It turns on its own, not with the
 * scroll. It's CSS only: each label runs the same orbit with a different
 * start, and turns back against it so it always faces the reader. The ones
 * at the back go behind the title and get dimmer. It pauses off screen
 * (data-ambient) and with reduced motion it stays still. It's decorative,
 * the steps are written out under the hero.
 */
export function KitOrbit({ title, subtitle }: { title: string; subtitle: string }) {
  const count = kit.steps.length;
  // Where each item starts, as a part of one full turn.
  const at = (share: number) => ({ "--orbit-at": share }) as CSSProperties;
  return (
    <div data-ambient data-kit-orbit aria-hidden="true" className="kit-orbit">
      <div className="kit-orbit-tilt">
        <span className="kit-orbit-ring" />
        {kit.steps.map((step, index) => (
          <span key={`node-${step.id}`} className="kit-orbit-item" style={at((index + 0.5) / count)}>
            <span className="kit-orbit-face">
              <span className="kit-orbit-node" />
            </span>
          </span>
        ))}
        {kit.steps.map((step, index) => (
          <span key={step.id} className="kit-orbit-item" style={at(index / count)}>
            <span className="kit-orbit-face kit-orbit-label">{step.name}</span>
          </span>
        ))}
        <span className="kit-orbit-title">
          <span className="block font-display text-2xl leading-tight sm:text-[1.75rem] font-semibold tracking-[-0.02em] text-paper">
            {title}
          </span>
          {/* On a phone the ring is too small for a second line, the labels would go over it. */}
          <span className="mt-1 hidden text-[0.8125rem] text-white/70 sm:block">{subtitle}</span>
        </span>
      </div>
    </div>
  );
}
