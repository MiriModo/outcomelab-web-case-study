# Code samples

These files come from the production codebase. The code itself is the same,
I only rewrote some of the comments to be shorter and easier to read. They
import other parts of the project (small components, CSS modules, the content
file) that are not included here, so they won't run on their own.

Two files are excerpts and say so in their header: `globals.excerpt.css` and
`site.excerpt.ts`. The rest are full files.

I left out the contact form handler and the emails on purpose. That part was
built by Serban, not by me.

## Scroll hero

**`LaptopScrollHero.tsx`** is the home hero on desktop. The section is a tall
track with a sticky view inside it, and on every scroll frame the script works
out the progress (0 to 1) and moves everything from it: the size of the
computer, the dark panel going back, the numbers fading, the white gradient
and the intro coming in. The part I care about most is how the computer grows.
It isn't scaled with a transform, because then the browser could scale it like
a bitmap and the text would get blurry. Instead the drawing is laid out again
at the size it's shown (CSS `zoom`) and only moved. The same file also sets
`--lt-t`, which drives the animation on the computer's screen, and adds extra
scroll on short laptop screens so the cards after the hero can still be
reached.

**`globals.excerpt.css`** has the design tokens (the three shades of blue
with their contrast ratios, the fonts) and the four motion tokens that all
become 0 with reduced motion. It also has the trick that lets the computer
animation work in two ways: in the normal hero it's a 10 second loop, and in
the scroll hero the same animations are paused and get a negative
`animation-delay` from `--lt-t`, so they're frozen at the point the scroll
asks for. The CSS-only 3D orbit from the Outcome Kit page is in here too.

## Outcome Kit

**`KitShowcase.tsx`** is the orbit of five cards on the home page. The
section is pinned while you scroll through it, and the scroll position goes
through a small `dwell()` function so each card stays in front for a moment
before the orbit turns to the next one. The orbit then follows that target
with easing based on the real frame time, so it glides the same way on 60Hz
and 120Hz screens and stops asking for frames once it gets there. On phones
the same list is a swipe carousel with scroll snapping, and the markers
follow whichever card is snapped in view.

**`KitOrbit.tsx`** is the orbit in the Outcome Kit page hero. It has no
JavaScript at all: each label gets a `--orbit-at` head start and the CSS in
`globals.excerpt.css` does the rest.

## Home sections

**`ModelComparison.tsx`** is the "Traditional consulting / Outcome Lab"
switch. Most of the animation is in CSS (each row has its index in `--i` for
the delay), and the component mostly handles state and accessibility:
`aria-pressed` on the buttons, an `aria-live` list and a hidden "replaced by"
so a screen reader hears the change, not just the new word.

**`WorldChangedHeadline.tsx`** is the "Consulting needs to change with it"
headline. Each letter of "change" is a vertical strip of random characters
that scrolls and lands on the right letter, the first one at 45% of the time
and the last one at the end. The random strips are only made in the browser,
so the server render and the first paint just show the normal word, and
screen readers get the word from a hidden span.

## Motion system

**`Reveal.tsx`** fades content in when you scroll to it. It checks where the
element is when it mounts and leaves it alone if it's already on screen, so
nothing on the first screen ever animates and the text never needs JavaScript
to be visible.

**`AmbientMotion.tsx`** is one `IntersectionObserver` for every looping
animation on the page. Off screen they get `data-offscreen` and the CSS pauses
them, so the browser isn't animating things nobody can see.

**`SectionProgress.tsx`** turns the dotted circle from the logo, which sits in
every section label, into a reading progress ring for that section.

**`SmoothScroll.tsx`** sets up Lenis and sends same-page anchor links through
it. The second half fixes a problem I found later: Next.js keeps the scroll
position between pages when part of the new page is already in view, so
leaving a long page near the end dropped you on the footer of the next one.
Now every route change goes to the top, except for back/forward and links
with a `#hash`.

## Content and sharing

**`site.excerpt.ts`** is a short part of the content file. All the text on
the site lives there, grouped by page, and the components only read from it.
The five steps of the Outcome Kit, for example, feed both orbits, the step
sections on the Outcome Kit page and the links between them.

**`opengraph-image.tsx`** generates the 1200 x 630 share image at build time,
with the logo, the hero headline and the self-hosted Archivo font, so the
preview always matches the site.
