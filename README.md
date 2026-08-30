# Personal Website

Next.js 16 (App Router) + TypeScript + Tailwind v4.

```bash
npm run dev
```

## Hero section

Built from the Figma frame `Hero Section` (`40004023-1265`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40004023-1265),
which superseded the first hero (`40003898-1075` — left-aligned lockup over the
"hand of stars" artwork, with its usta.agency-style particle-hand hover;
`components/effects/ParticleHand.tsx` and `public/figma/hero-bg.png` remain in
the repo but are no longer mounted). A 1600 × 960 black frame.

| File | Role |
| --- | --- |
| `components/hero/HeroSection.tsx` | Layout, headline, avatar, flares, stats |
| `components/hero/TopNav.tsx` | Logo + Let's Talk / Menu |
| `components/hero/CustomerLogos.tsx` | The customer logo rail |
| `components/hero/MaskedLogo.tsx` | Renders a logo as a fill clipped by its artwork |
| `components/effects/LookAtAvatar.tsx` | Tilts the avatar toward the cursor |
| `components/effects/ScrollGrow.tsx` | Scroll-driven avatar growth to the End view frame |
| `public/figma/hero/` | Assets exported from the frame (Desktop Bridge) |

### Mouse effects

**The avatar look-at** is a port of tonemaki.com's cursor-following hero cat —
which is a genuine Spline 3D scene with mouse Look-At — approximated as far as
a flat PNG allows: a perspective tilt (±14° Y, ±10° X) plus a few px of drift
toward the cursor, spring-damped (8%/frame) so it trails and settles. Each
pointer event advances the spring synchronously with a rAF tail, so throttled
frames can't freeze it. Off under `prefers-reduced-motion` and on coarse
pointers. A real head-turn would need the avatar as a rigged 3D model (e.g.
Spline), which can replace the PNG wholesale later.

(A second tonemaki port — its mouse-driven background dot-wave — was built,
matched to the reference pixel-for-pixel, and then removed on client request;
see git history for `components/effects/DotWave.tsx` if it ever wants
reviving.)

(A per-character blur-in title reveal — trionn.com's headline animation with
that site's own numbers — was built for every section title and then removed
on client request; see git history for `components/effects/TitleReveal.tsx`.
Its two hard-won lessons, should it return: split only after
`document.fonts.ready`, and convert `text-indent` to an inline spacer first —
it inherits into every split char and explodes the layout.)

**The scroll growth** interpolates the avatar between the two hero frames:
`Hero Section` (40004023:1265, 302 × 453) and `End view` (40004062:2894,
742.7 × 1114) — exactly 2.4593× about `top center`, both read from the file.
Scroll position drives the target (full scale at 60% of a viewport of
scrolling, so the end state is seen while the hero is still on screen) and
the same sync-step-plus-rAF spring as the look-at smooths it. Per the End
view's own layer order the avatar paints *above* the logo rail — the content
wrapper carries `z-30` over the rail's `z-20`, which changes nothing at rest
because the avatar's rail-overlap region is transparent at scale 1. Off under
`prefers-reduced-motion`.

### Layout

The lockup is centred: H1 at y 180 (77px under the 103px nav), the CTA 48px
below it, and the 302 × 453 avatar box directly under the CTA — its lower,
transparent-ish half runs to y 907, sliding behind the logo rail, which paints
on top (`z-20` over the avatar; recreated with `lg:mb-[-95px]`). The `Flares`
sunburst is bottom-anchored and centred at 1094⁄1600 of the frame width
(`w-[max(68.4%,560px)]`, exported at 2×). Stats sit bottom-left and the
positioning statement bottom-right, bottom-aligned to each other — at `lg` an
absolute row anchored 56px above the logo rail (client feedback; the frame had
them slightly higher), over the same 1248px column every section shares.

The nav's photo background is gone in this frame — it specs a plain
black → transparent gradient — and the Menu button's border is full white (the
old frame had it at 20%).

### The logo rail

Eight 224 × 132 cards, 16px apart (1904px total), centred so the rail
deliberately bleeds past each edge of a 1600px viewport, 16px off the
section's bottom. No "Trusted by" label and no "Add Your Logo" card in this
version, and the frame's Telenor card is dropped on client feedback. Five
cards carry over from the first hero; the three new marks — Dr. Badi, Opseek,
and the site's own wordmark — are grey `#717171` SVG exports in
`public/figma/hero/`. Below `lg` the rail is a horizontal scroller.

Design tokens (`--color-ink`, `--color-accent`, `--color-muted`, …) live in the
`@theme` block in `app/globals.css`.

### Typefaces

All three faces the frames use are the real thing.

**Feature Deck** — the display face — is self-hosted from the trial the designer
supplied, at `app/fonts/feature-deck-regular.woff2` (19KB, converted from the
supplied TTF), wired through `next/font/local` in `app/layout.tsx`. Everything
reads it through the `--font-display` token, so swapping the file at that path
is the only change a licensed version needs. Verified rendering rather than
assumed: the webfont sets the About statement to 866.4px at 56px, identical to
the desktop-installed Feature Deck and distinct from the 832.0px Times fallback.

Two things to know about that file:

- **It is the trial cut.** Before this goes public it needs a real webfont
  licence from Commercial Type.
- **It carries only 74 codepoints** — `A–Z a–z 0–9 . , ' " ! ? -` and curly
  quotes. Across all 14 display elements on the site the only character it lacks
  is `&`, in the Work heading, which falls through to Times New Roman. Every
  other display string is fully covered.

Earlier revisions rendered this in Instrument Serif and then Playfair; both are
gone. For the record, at the design's own 56px / 886px setting Instrument Serif
measured **80%** of Feature Deck's width — which is what made the type read
squashed — and Playfair **98%**.

**Inter** requests the `opsz` axis, so `font-optical-sizing: auto` gives the
display optical size at display sizes. That is what Figma means by
`Inter Display`; the two are the same family, not a substitution.

### Responsive notes

The frame only specifies a 1600 × 960 desktop layout. Below that:

- `< sm` — the "Let's Talk" button is hidden, leaving Menu as the entry point.
- `< lg` — the centred stack stays (headline clamps down from 90px, avatar to
  220px), and the stats + statement fall back into the flow under the avatar
  instead of pinning to the bottom corners.
- `< lg` — the logo rail becomes a horizontal scroller. At `lg` and up it is
  centre-clipped, matching the design's intentional 2144px bleed.

## About Me section

Built from the Figma frame `About Me Section` (`40003959-1653`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1653).
A 1600 × 1508 light frame — white ground, black display statement — that follows
the dark hero.

| File | Role |
| --- | --- |
| `components/about/AboutSection.tsx` | Label, statement, portrait, body copy, divider |
| `components/about/PhotoCollage.tsx` | The seven-photo collage |
| `public/figma/about/` | Assets exported from the frame |

### Layout

Horizontal offsets are percentages of the same 1200px content column the hero
uses (`max-w-[1248px] px-6`), so both sections stay in register and the
composition scales between `lg` and the 1600px design width.

Vertical rhythm is pinned instead: the intro grid declares the frame's own row
heights (`lg:grid-rows-[290px_284px]`), which keeps the portrait at y 422, the
divider at y 530, the body at y 624 and the collage at y 878.66 even though the
substituted faces wrap to a different number of lines than Figma does. Copy that
runs longer than designed spills into the 145px gap above the collage rather
than pushing everything below it down.

The collage places each photo as a percentage of a 1200 × 469.6875 stage, so the
arrangement scales as one piece.

### Collage reveal

The six outer photos start stacked on the centre image at zero opacity and
spread outward into place the first time the stage scrolls into view.

`CollageReveal` is a client component whose only job is to flip
`data-reveal="pending"` to `"in"` on the stage; everything else is CSS in
`globals.css`. It writes the attribute straight to the DOM rather than holding
React state — the component never needs to re-render, and React leaves a prop it
did not itself change alone, so a re-render higher up can't rewind the reveal.

- **The offsets carry no pixel values.** `--tx` / `--ty` on each photo are the
  translation onto the anchor expressed in percent of *that photo's own box*,
  which is what `translate()` resolves percentages against. They stay exact at
  every stage size, including the 720px floor where the rail scrolls — measured
  start centres land within 0.03px of the anchor's at both 1600 and 390.
- **The centre image is the anchor.** It carries no offset and takes `z-index: 1`,
  so the others are clipped by it on the way out and read as emerging from
  behind rather than sliding in over the top. None of the photos overlap at
  rest, so the raised z-index changes nothing about the final composition.
- **Opacity and travel share one clock and one curve** (1.2s,
  `cubic-bezier(0.33, 1, 0.68, 1)`), so opacity is exactly the fraction of the
  distance covered — 35% out is 35% visible, and a photo reaches full opacity as
  it arrives. Pairing a hard ease-out transform with a slower opacity curve was
  the first attempt and read as a slide followed by a separate fade-up in place.
- **Nearest-first, 55ms apart**, ordered by distance from the anchor, which
  makes it one outward push instead of six entrances. Longest path finishes at
  about 1.5s.
- **Only position and opacity animate.** No scale, no rotation; the final
  position, size, aspect and cropping are the frame's, untouched.

Every path that would leave the animation unplayed resolves to the finished
composition instead, all verified: `prefers-reduced-motion` and a slow
hydration through CSS, a missing `IntersectionObserver` through an early flip,
and JavaScript disabled entirely through a `<noscript>` override.

### Collage hover

Once every photo has landed, the stage hands over to the same shove-on-hover
physics as My Process — `components/effects/shoveOnHover.ts`, which both
sections now share so they cannot drift apart. Swipe through a photo and it is
shoved along the cursor's path with a GSAP inertia tween, spinning if the swipe
clipped it off-centre, then decays back to rest.

- **The handover is tied to the animation, not to a duration copied out of the
  stylesheet.** `CollageReveal` counts `transitionend` for `transform` across
  the six travelling photos, and only when the last one lands does it flip the
  stage to `data-reveal="done"` and arm the physics. Shoving a photo that is
  still flying in would race the CSS transition.
- **The shove moves an inner wrapper, never the `li`.** The `li` is the hit area
  and stays put, so the hover target can't slide out from under the cursor, and
  the shove composes with the reveal's transform instead of fighting it on one
  element. `overflow-hidden` moved onto that wrapper with it, so each fill stays
  clipped to its frame while the frame itself glides.
- Measured on the two sections side by side: both peak around 72px of travel
  about 120ms after entry and decay to exactly 0 by ~950ms. The collage's stays
  on-axis where a Process card also picks up a `y` component, which is the
  helper's tilt correction rotating the shove into a ±12° card's own frame.
- **Off where it would be wrong**, both verified: no listeners are attached at
  all under `prefers-reduced-motion`, or on touch / coarse pointers where a
  shoved photo would simply stay shoved.
- **Nothing clips a shoved photo.** The rail's `overflow-x: auto` used to crop
  them: CSS blockifies the other axis as soon as one axis scrolls, so an
  `overflow-y` nobody wrote became `auto` and the box cut hovered photos on all
  four sides — most visibly along the bottom. The scroller now exists only below
  `md`, which is exactly where the 720px stage outgrows the `100vw - 48px`
  column, and the section takes `overflow-x: clip` so a shove near a narrow
  viewport's edge can't push the page into horizontal scroll. `clip` rather than
  `hidden` for the same blockification reason — it is the one value that bounds
  one axis and leaves the other alone. Verified from 390px to 1600px: no page
  scroll anywhere, scroller present only under 768px.

### Known substitutions and design notes

- **Typography matches the frame exactly.** The statement is Feature Deck
  Regular 56 / 110% / 0 in the frame's own 886 × 290 box, on the same five lines
  with the same breaks; the body copy is Inter Display 24 / 130% / -0.96px in
  its 568 × 110 box, on the frame's four lines; the label is Spline Sans Mono
  Medium 14 / normal / 0. Nothing here is a substitution or an approximation.
- **The divider is invisible by design.** `Frame 1948759103` specs its 1278px
  rule as `#fff` at 12% opacity, which reads as a leftover from the dark hero —
  on this section's white ground only the small `#D8D8D8` cross mark at x 1188
  shows. Reproduced as spec'd; `border-black/12` in `AboutSection.tsx` reveals
  it.
- **`My Photo` has a dead layer.** Its lower fill is a screenshot of an unrelated
  website, fully occluded by the opaque portrait above it, so it is not shipped.
- The label and body copy are standardized to `#575757` (from Figma's
  `#808080`) per client request — every grey text run across the site's three
  white sections (About, Selected Work, Testimonial) now resolves to this one
  value. It clears WCAG AA at both sizes — 7.23:1 on white — where the
  original `#808080` failed at 14px (3.95:1).

### Responsive notes

- `< lg` — the two columns stack: label, statement, portrait, body, divider.
- The collage stops scaling at 720px wide and becomes a horizontal scroller
  below that, so the smallest photo never drops under ~98px.

## My Process section

Built from the Figma frame `My Process Section` (`40003959-1675`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1675).
A 1600 × 1287 frame on pure black (`BG Color` = `#000000`, a shade darker than
the hero's `--color-ink`), following the white About section.

| File | Role |
| --- | --- |
| `components/process/ProcessSection.tsx` | Section shell and title |
| `components/process/ProcessCards.tsx` | The six tilted step cards, badges, hover physics |

The section ships no assets — every element is type or a solid fill.

### Layout

The frame is a display title at y 160 and a *fixed-size* cluster of six cards
occupying 916.006 × 714.771, centred on x 800 (x 342 → 1258, y 412 → 1127).
Because that cluster is artwork rather than a fluid column, it is reproduced at
1:1 from `lg` up — no scaling — so every number in the component is the literal
Figma value, and the section is exactly 1287px tall.

Each card is placed by its **un-rotated top-left corner** (Figma's own `x`/`y`
for a rotated node) and carries `origin-top-left`, which is the rotation Figma
applies; positions are therefore the frame coordinate minus the cluster origin.
Cards hug their title, tilt ±12°, and hang a 28px number badge 10px off their
top-right corner.

`z-index` reproduces the frame's paint order — Figma stacks the cards
1, 5, 3, 2, 6, 4 back to front — while the DOM stays in step order 1 → 6 so the
`<ol>` reads correctly. The only place the order is visible is badge 4, which
sits on top of the *Research & Wireframe* card; the cards themselves are all
`#171717`, so card-on-card overlaps leave no seam.

### Type

Taken verbatim from the frame:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `My Process` | 140 / 140px (100%) | -2.8px (-0.02em) |
| Card label | 16 / 19px | 0 |
| Card title | 36 / 44px — **set to 28px here** | 0 |
| Badge number | 14 / 17px | 0 |

Figma sets those three card line heights to *Auto* and lays the frame out from
the rounded results (19 + 28 + 44 + 48 = 139px, the height of every card). They
are written here as ratios — `leading-[1.1875]`, `leading-[calc(44/36)]` — so
the same proportions survive the smaller card title and the mobile sizes.

**The card title runs at 28px, not the frame's 36px**, at the client's request,
and the card box must not shrink with it. Figma hugs each card to its title, so
`Step.w` pins the width each card hugged to at 36px and the card takes the
frame's 139px height outright; `justify-center` then centres the shorter stack
inside it, which is the frame's own layout mode. Positions, tilts, overlaps and
the section's 1287px height are therefore untouched — only the title is smaller.
Change the two `text-[…px]` values on the title and drop `Step.w` to go back to
a card that hugs the design's 36px.

### Known substitutions

- **Display face** — Feature Deck itself, as everywhere. The title sets at
  637px against Figma's 641px.
- **The hover physics live in `components/effects/shoveOnHover.ts`**, shared
  with the About collage. The reference behaviour and its parameters are
  documented there.
- **Card copy** is Inter at its display optical size, matching the frame's
  `Inter Display`. The card measurements below were taken against the earlier
  stand-in faces and have not been re-derived since.
  The composition absorbs it — cards grow rightwards from their pinned corner
  and the cluster still fits — but adding `axes: ["opsz"]` to the `Inter` import
  in `app/layout.tsx` would close most of the gap, at the cost of also changing
  how the hero and About sections render. Those inflated widths are what
  `Step.w` now freezes, so the pinned cards match the build they were signed off
  against rather than Figma's narrower hug.

### Hover physics

The cards carry the shove-on-hover effect from the client's reference site
(`more-nutrition.webflow.io`, the payment-methods circles), reverse-engineered
from that site's `app.js` and rebuilt in `ProcessCards.tsx` with the same GSAP
version (3.15.0) and the same parameters:

- A `mousemove` listener on the cluster samples the cursor once per animation
  frame; the delta between samples is the cursor velocity, in px/frame.
- `mouseenter` on a card shoves it with an InertiaPlugin tween — x/y at 30×
  the cursor velocity (clamped ±1080), decaying to rest at 0 with
  `resistance: 180` — so it flies in the swipe direction and glides back.
- Spin is the cross product of the entry offset (from the card's centre) with
  the velocity, over the offset's length: swipe through the middle and it
  barely turns, clip a corner and it kicks. 15× that, clamped ±60 deg/s.
- The `li` stays put as the hit area; an inner wrapper (card + badge) is what
  moves, so the target never slides out from under the cursor — the reference
  splits its hit cells and circles the same way.

Two deltas from the reference, both deliberate:

- The cursor velocity is rotated into the card's local frame before it becomes
  the shove, because the movers here sit inside the ±12°-tilted `li`s (the
  reference movers are unrotated). Without this a horizontal swipe would drift
  12° off; with it the screen-space trajectory matches the reference exactly —
  verified by scripting identical swipes against this component and against
  the reference handler running on the same GSAP build, and comparing the
  sampled curves: peak 24.24 vs 24.25px, settle 748 vs 747ms, max deviation
  1.24px / 0.13° over the flight.
- The effect also stays off under `prefers-reduced-motion` (the reference only
  gates on `(hover: hover) and (pointer: fine)`; both gates apply here).

### Responsive notes

- `lg` and up — the frame's exact composition, 1:1. `lg` (1024px) is the lowest
  width that fits it: the cluster measures 944px once the wider face is applied,
  leaving 26px on each side.
- `< lg` — the cards stack into a centred column, keeping their tilt at a
  shallower ±5° so the rotated boxes still clear the viewport.
- The card title steps 28 → 24px and the label 16 → 14px, so titles stay on one
  line down to 390px; at 320px the three longest wrap to two. Below `lg` the
  card hugs its content again, since a wrapped title would overflow a fixed
  height.
- The section title is fluid (`clamp(48px, 13vw, 140px)`), reaching its full
  140px at the `lg` breakpoint.

## Selected Work section

Built from the Figma frames `1st` (`40004033-2020`, the section's 1600 × 938
pinned view) and the four project cards (`40004036-2450` / `2484` / `2520` /
`2553`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40004033-2020);
the type spec descends from the earlier single-card `Work` frame
(`40003959-1707`), which `1st` supersedes. A white section that follows the black
Process section. The title and project name inherit pure `#000000`
(`text-black`) rather than the `--color-ink` token's `#0c0c0c` — a client
request to make every black text run across the site's three white sections
resolve to one flat value, matching the grey standardization below.

| File | Role |
| --- | --- |
| `components/work/WorkSection.tsx` | Title, the four cards, and the scroll driver |
| `components/effects/ChromaDistort.tsx` | Cursor distortion on the card images |
| `.work-*` rules in `app/globals.css` | The pin, and the track's sizing |
| `public/figma/work/` | The four card mockups |

### The horizontal scroll

The section pins itself for the length of one horizontal track — the display
title followed by the four cards — and scrolling down slides that track left, so
the visitor reads the projects across before the page continues.

The track is laid out once, in CSS, and the motion falls out of the numbers:

| Piece | Width |
| --- | --- |
| Leading pad | 200px, the frame's margin |
| Title box | 487px |
| Title → first card | 130px, the `1st` frame's own gutter |
| Each card | 760px |
| Between cards | 160px |
| Trailing pad | 200px, the same margin |

At 1600 × 938 that totals 4537px, so the track overhangs the viewport by 2937px.
The section is made exactly that much taller than the viewport and the transform
is `-progress × 2937` — one pixel of vertical scroll is one pixel of horizontal
travel. The two ends are consequences of those numbers rather than being placed
by hand:

- **At rest** the title sits at x 200 and the first card at x 817 → 1577: the
  `1st` frame reproduced exactly, which is the section's default view.
- **At 100%** the last card lands at x 640 → 1400, closing on the same 200px
  margin the section opens with.

The pin is an enhancement, not a dependency. It lives entirely behind
`@media (min-width: 64rem) and (prefers-reduced-motion: no-preference)`, so the
markup React renders — and everything the server sends — is an ordinary vertical
stack. There is no layout flash while the script boots, and no JS requirement
below `lg` or for a visitor who asks for reduced motion. The component only
measures the track and writes the transform, throttled to
`requestAnimationFrame`, re-measuring on resize, on a change to that media
query, and when a `ResizeObserver` sees the track settle as the display face
loads.

### Card hover distortion

Moving the cursor over a card smears the image in the direction of travel with
a rainbow-edged (spectral chromatic aberration) streak, and the picture relaxes
back as the cursor rests. It is a port of the work-list hover on
[vividmotion.co](https://www.vividmotion.co/), taken from the site's own inline
three.js source rather than recreated by eye — the fragment shader is theirs
verbatim, as are the tuning values (64 × 64 field, strength 0.15, radius 0.15,
relaxation 0.87, aberration 0.15, 60-frame cooldown, DPR capped at 1.5).

Mechanically: each card owns a 64 × 64 float DataTexture as a velocity field.
`pointermove` splats smoothed cursor velocity into the cells around it; each
frame the field decays (× 0.87) and the shader warps the image by the blurred
field, adding a 32-sample R/G/B-gaussian streak along the mouse→pixel direction
where the field is strong. All four cards render through one fixed,
pointer-transparent canvas, each into its own scissor rect read from the DOM
that frame — which keeps the planes glued to the cards while the track
translates underneath.

Two deliberate departures from the reference. Their `<img>`s are hidden
permanently and WebGL also paints the resting state; here the real `<img>`
stays whenever the field has settled, and the canvas only takes over while the
effect is live — so scrolling stays native and any WebGL failure just leaves
the ordinary images. And their scroll-in reveal (`uZoom` 1.5 → 1 with a
clip-path sweep) is not wired up.

The effect obeys the same gate as the pin — `lg` and up, motion-safe — plus a
working WebGL context. Each card's texture is loaded with `TextureLoader` from
the `next/image` element's own resolved URL (a cache hit, so effectively free).
Adopting the DOM element directly (`new THREE.Texture(img)`) looks equivalent
but silently uploads nothing for a `fill` image in this three version — the
draw raises `GL_INVALID_VALUE` and samples come back transparent black.

### Card sizing

The card is 760px wide in the frame, but it also has to fit the viewport's
height — the block is the mockup (540 ÷ 760 of the width) plus 78px of caption.
`--work-card-w` is `min(760px, 86vw, (100svh - 238px) × 1.4075)`, which holds
the full 760px on any viewport about 780px tall or more and scales the card down
below that. Every other measurement in the track — the title box and its type
size, both gutters, the trailing pad — is derived from that one value, so the
composition scales as one piece: 760px at 1600 × 938 through 1280 × 800, 746px
at 1024 × 768, 566px at 1024 × 640, with the gaps following (160 → 157 → 119).

Caption type is the exception: it does not scale, so the name, year and chips
keep the frame's exact 20 / 14 / 12px at every width.

### Type

Taken verbatim from the frame. Letter spacing is written in `em` so it stays
exact at every size the title takes:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `Selected work & explorations` | 80 / 80px (100%) | -1.6px (-0.02em) |
| Project name and title | 20 / auto (1.21 → 24px) | -0.8px (-0.04em) |
| Year | 14 / auto (1.21 → 17px) | -0.56px (-0.04em) |
| Tag chip | 12 / 14.112px (117.6%) | -0.1008px (-0.0084em) |

Figma sets the two caption line heights to *Auto*, which resolves to Inter's own
1.21 and is what produces the frame's 24px and 17px text boxes. They are pinned
to `1.21` rather than left as `normal` so the geometry survives a font fallback.

The chips carry Figma's cap-height trim (`text-box: trim-both cap alphabetic`);
where a browser doesn't support it, centring the 14.112px line box in the 24px
chip lands within half a pixel of the same result.

### The card mockups

The four mockups are the same renders the Short Portfolio ring uses, so they are
derived from `public/figma/Short Portfolio Mockups` rather than exported again:
TripMate #3, beBuy #1, Opseek, and Rasry #1. Each is centre-cropped from its
native 1.347 or 1.333 aspect to the card's 760 × 540 (1.4074) and written at
1520 × 1080 — 2× the display size, 235–365KB each.

### Known substitutions and design notes

- **All four cards' copy is verbatim from their frames** (read via the Desktop
  Bridge). The chip labels keep Figma's own characters — its casing is
  inconsistent (`UX Audit` vs `UX audit` vs `developer handoff`) but every chip
  renders through `uppercase`, exactly as Figma's `textCase: UPPER` does.
- **The pin has no lead-in.** The track's leading and trailing pads are both
  the frame's 200px margin, so the section is already in its designed layout
  when it arrives and simply starts moving — rather than sliding in from a
  wider resting offset.
- **Display face** — Feature Deck itself. The two title lines set at 469px and
  487px, the second filling the 487px box exactly as the frame does. A
  non-breaking space pins the `&` to `explorations`, which is where Figma breaks
  the line.
- **This is the one place the trial font shows.** Its 74-codepoint set has no
  `&`, so that character alone falls through to Times New Roman and sits lighter
  than the Feature Deck around it. A licensed cut fixes it with no code change.
- **Caption copy** is Inter at its display optical size, matching the frame's
  `Inter Display`.
- Two layers in the frame are hidden and are not shipped: a button under the
  title (`Frame 1000004521`), and a `Live Website` / `Behance Case Study` link
  pair under the tags (`Frame 1948759128`).
- The meta copy (year and tag chips) is standardized to `#575757` (from Figma's
  `#636363`, `Text/Body 1`) — see the About section's notes. It clears WCAG AA at
  both caption sizes — 6.34:1 on the `#f0f0f0` chips, 7.23:1 for the year on
  white.

### Responsive notes

- `lg` and up — the pinned track above.
- `< lg`, or `prefers-reduced-motion: reduce` — no pin: the title sits above the
  four cards in one full-width column, and the section scrolls normally.
- The title is fluid (`clamp(44px, 5.66vw, 80px)`) in the stacked layout; inside
  the track it is sized from `--work-card-w`, reaching its full 80px whenever the
  card is at 760px.
- The caption and the chips wrap rather than shrink, so the type keeps its exact
  Figma size at every width. The name row goes to two lines at 390px and the
  chips to two rows.

## My Specialist Field section

Built from the Figma frame `My Specialist Field` (`40003959-1931`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1931).
A 1600 × 1354 frame on pure black (`BG Color` = `#000000`, the same ground as
My Process), following the white Selected Work section.

| File | Role |
| --- | --- |
| `components/specialist/SpecialistSection.tsx` | Label and the six numbered service rows |

The section ships no assets — every element is type or a border.

### Layout

The frame keeps the 200px margins the hero and About share, so it is expressed
against the same 1200px content column (`max-w-[1248px] px-6`). The label sits
at that column's left edge; the `Services` block (x 445 → 1400, 955 × 890) is
flush with its right edge — 955 ÷ 1200 = 79.5833%.

Inside the block every measurement is a ratio of the service name's own size,
which is what the `--svc` custom property carries:

| Figma | ÷ 100 |
| --- | --- |
| Numeral column, 164px | 1.64 |
| Numeral, 24px | 0.24 |
| Name box, 75px | 0.75 |
| Row, 115px | 1.15 |
| Row gap, 40px | 0.4 |

`--svc` is in turn the content column ÷ 12 (`clamp(34px, calc(8.3333vw - 4px),
100px)`, since `px-6` takes 48px off the viewport and 1200 ÷ 12 = 100), so the
block scales as one piece and lands on the frame's exact geometry once the
column caps at 1200px — the section measures 1600 × 1354 there, with the rules
at y 379, 534, 689, 844, 999 and 1154.

Each row is a 75px box holding the numeral and the name, then 40px of clearance
down to the rule. Figma trims both text boxes to cap height / alphabetic
baseline, which puts their shared baseline on that box's bottom edge; pinning
the box to 0.75 keeps the baseline where the frame puts it even though the
substituted display face has a different cap height than Feature Deck. Every
name begins at x 164 — Figma's per-row `Service Name` frames only differ in
width because they hug a different name.

`Line 16` is a zero-height line sitting on the row's bottom edge, so it is
reproduced as a `border-b` inside a border-box height rather than as the
exported SVG; the six rows then measure the frame's exact 890px.

### Type

Taken verbatim from the frame. Letter spacing is written in `em` so it stays
exact at every size the clamp resolves to:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `My Specialist Field` | 24 / 24px (100%) | 0 |
| Row numeral | 24 / 24px (100%) | -0.48px (-0.02em) |
| Service name | 100 / 100px (100%) | -2px (-0.02em) |

Both row texts carry Figma's cap-height trim (`text-box: trim-both cap
alphabetic`), which is what produces the numeral's 17px box and the name's 75px
box on a shared baseline.

### Colour

- The label is `#d0de00` (`--color-accent`) at 14:1 on black, with `My ` at 48%
  of it — an effective `#646b00`, 3.6:1. That clears WCAG AA as large text at
  its 24px design size, so the label holds 24px at every width rather than
  stepping down with the rest of the section.
- The names are `Text/Body 2` (`--color-body-2`, `#a5a5a5`) at 90%, and the
  numerals are Figma's raw `#949494` (`--color-numeral`). Over black those are
  the same grey — 90% of `#a5a5a5` is exactly `#949494` — at 6.9:1.
- `Line 16` is `#fff` at 12%, the same rule spec the About section uses.

### Known substitutions and design notes

- **Display face** — Feature Deck itself. The longest name, *Mobile App
  Design*, sets at 757px against Figma's 760px.
- **Label and numerals** are Inter at its display optical size, matching the
  frame's `Inter Display`.
- **Every row hides an `Inner Service Chip`** — a 580 × 254 frame at x 102,
  y -79, overlapping the row above. It reads as a hover preview that is
  switched off, and the component set exposes no variant other than `Default`,
  so the rows ship as plain, non-interactive list items.
- A second hidden layer, `Frame 1948759134` ("Website Design" at x 563,
  y 1005), is also not shipped.
- The numerals are `aria-hidden` — the `<ol>` already carries the order.

### The hover state

Every row has a `Hover - …` frame in `40004041-2749`, and the delta between it
and the default row is the whole interaction: the numeral goes from
`--color-numeral` to the accent, the name from `Text/Body 2` at 90% to pure
white, and a cloud of two to five chips appears over the row.

`components/specialist/ServiceChips.tsx` carries the motion. The brief names
the `Our specialties` list on athleticsnyc.com as the reference for how the
reveal should feel, so the timings are read out of that site's own bundle
rather than estimated, and reproduced with CSS transitions — no GSAP, no new
dependency:

| | Athletics | Here |
| --- | --- | --- |
| Chip scale in | 0.2 → 1, 600ms, `back.out(1.7)` | same, `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| Chip fade | 300ms, `power3.out` | same, `cubic-bezier(0.215, 0.61, 0.355, 1)` |
| Stagger | shuffled, `amount: .15` | shuffled, 0 → 150ms of `transition-delay` |
| Hide | scale → 0, no stagger | same |
| Cursor drift | `(cursor − centre) ÷ 50 × (1 + factor)`, 600ms `power3.out`; factor is `2 × random` on even chips, `1 × random` on odd | same, factor derived from the label |

Two details differ deliberately. Athletics scatters its chips over a random
CSS grid on every mount; ours are placed from the frame, by the row
coordinates the hover frames give (x 102, y -43 → `{ x: 1.02, y: -0.43 }`,
riding `--svc` like everything else), so the arrangement is the designed one.
And where Athletics calls `Math.random()` for the shuffle order and the drift
factors, both are hashed from the chip's label here — random during render
would break hydration, and random in an effect would reshuffle on every
keystroke of state.

Scale and drift both want `transform`, which GSAP composes and CSS cannot, so
each chip is two nested elements: the outer one takes the cursor translation,
the inner one the scale and opacity. Drift is written straight to the DOM
inside a `requestAnimationFrame`, so moving the mouse never re-renders React.

The chips are `pointer-events-none`, `aria-hidden` (they restate the row's own
service), and gated behind `pointer-fine`, so touch devices never render them.
The hovered row lifts to `z-10` because chips overhang its neighbours, and the
section is `overflow-x-clip` — Marketing Design's widest chip runs 107px past
the row, which the 1600px frame has margin for and a 1248px viewport does not.

Chips are `Container` frames: a fixed 64px pill, 32px of side padding, width
hugging the label, `#1d1d1d` text at 18 / 120% tracking 0, cap-trimmed and
centred (Figma's own 25.5px offset falls out of `items-center`). Five fills
rotate across the rows — `#fbf3af`, `#e1daf7`, `#93eba9`, `#ff8f6c`,
`#ffb7fa`, all tokens in `app/globals.css`.

## Selected Work section

Built from the Figma frames `1st` (`40004033-2020`, the section's 1600 × 938
pinned view) and the four project cards (`40004036-2450` / `2484` / `2520` /
`2553`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40004033-2020);
the type spec descends from the earlier single-card `Work` frame
(`40003959-1707`), which `1st` supersedes. A white section that follows the black
Process section. The title and project name inherit pure `#000000`
(`text-black`) rather than the `--color-ink` token's `#0c0c0c` — a client
request to make every black text run across the site's three white sections
resolve to one flat value, matching the grey standardization below.

| File | Role |
| --- | --- |
| `components/work/WorkSection.tsx` | Title, the four cards, and the scroll driver |
| `components/effects/ChromaDistort.tsx` | Cursor distortion on the card images |
| `.work-*` rules in `app/globals.css` | The pin, and the track's sizing |
| `public/figma/work/` | The four card mockups |

### The horizontal scroll

The section pins itself for the length of one horizontal track — the display
title followed by the four cards — and scrolling down slides that track left, so
the visitor reads the projects across before the page continues.

The track is laid out once, in CSS, and the motion falls out of the numbers:

| Piece | Width |
| --- | --- |
| Leading pad | 200px, the frame's margin |
| Title box | 487px |
| Title → first card | 130px, the `1st` frame's own gutter |
| Each card | 760px |
| Between cards | 160px |
| Trailing pad | 200px, the same margin |

At 1600 × 938 that totals 4537px, so the track overhangs the viewport by 2937px.
The section is made exactly that much taller than the viewport and the transform
is `-progress × 2937` — one pixel of vertical scroll is one pixel of horizontal
travel. The two ends are consequences of those numbers rather than being placed
by hand:

- **At rest** the title sits at x 200 and the first card at x 817 → 1577: the
  `1st` frame reproduced exactly, which is the section's default view.
- **At 100%** the last card lands at x 640 → 1400, closing on the same 200px
  margin the section opens with.

The pin is an enhancement, not a dependency. It lives entirely behind
`@media (min-width: 64rem) and (prefers-reduced-motion: no-preference)`, so the
markup React renders — and everything the server sends — is an ordinary vertical
stack. There is no layout flash while the script boots, and no JS requirement
below `lg` or for a visitor who asks for reduced motion. The component only
measures the track and writes the transform, throttled to
`requestAnimationFrame`, re-measuring on resize, on a change to that media
query, and when a `ResizeObserver` sees the track settle as the display face
loads.

### Card hover distortion

Moving the cursor over a card smears the image in the direction of travel with
a rainbow-edged (spectral chromatic aberration) streak, and the picture relaxes
back as the cursor rests. It is a port of the work-list hover on
[vividmotion.co](https://www.vividmotion.co/), taken from the site's own inline
three.js source rather than recreated by eye — the fragment shader is theirs
verbatim, as are the tuning values (64 × 64 field, strength 0.15, radius 0.15,
relaxation 0.87, aberration 0.15, 60-frame cooldown, DPR capped at 1.5).

Mechanically: each card owns a 64 × 64 float DataTexture as a velocity field.
`pointermove` splats smoothed cursor velocity into the cells around it; each
frame the field decays (× 0.87) and the shader warps the image by the blurred
field, adding a 32-sample R/G/B-gaussian streak along the mouse→pixel direction
where the field is strong. All four cards render through one fixed,
pointer-transparent canvas, each into its own scissor rect read from the DOM
that frame — which keeps the planes glued to the cards while the track
translates underneath.

Two deliberate departures from the reference. Their `<img>`s are hidden
permanently and WebGL also paints the resting state; here the real `<img>`
stays whenever the field has settled, and the canvas only takes over while the
effect is live — so scrolling stays native and any WebGL failure just leaves
the ordinary images. And their scroll-in reveal (`uZoom` 1.5 → 1 with a
clip-path sweep) is not wired up.

The effect obeys the same gate as the pin — `lg` and up, motion-safe — plus a
working WebGL context. Each card's texture is loaded with `TextureLoader` from
the `next/image` element's own resolved URL (a cache hit, so effectively free).
Adopting the DOM element directly (`new THREE.Texture(img)`) looks equivalent
but silently uploads nothing for a `fill` image in this three version — the
draw raises `GL_INVALID_VALUE` and samples come back transparent black.

### Card sizing

The card is 760px wide in the frame, but it also has to fit the viewport's
height — the block is the mockup (540 ÷ 760 of the width) plus 78px of caption.
`--work-card-w` is `min(760px, 86vw, (100svh - 238px) × 1.4075)`, which holds
the full 760px on any viewport about 780px tall or more and scales the card down
below that. Every other measurement in the track — the title box and its type
size, both gutters, the trailing pad — is derived from that one value, so the
composition scales as one piece: 760px at 1600 × 938 through 1280 × 800, 746px
at 1024 × 768, 566px at 1024 × 640, with the gaps following (160 → 157 → 119).

Caption type is the exception: it does not scale, so the name, year and chips
keep the frame's exact 20 / 14 / 12px at every width.

### Type

Taken verbatim from the frame. Letter spacing is written in `em` so it stays
exact at every size the title takes:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `Selected work & explorations` | 80 / 80px (100%) | -1.6px (-0.02em) |
| Project name and title | 20 / auto (1.21 → 24px) | -0.8px (-0.04em) |
| Year | 14 / auto (1.21 → 17px) | -0.56px (-0.04em) |
| Tag chip | 12 / 14.112px (117.6%) | -0.1008px (-0.0084em) |

Figma sets the two caption line heights to *Auto*, which resolves to Inter's own
1.21 and is what produces the frame's 24px and 17px text boxes. They are pinned
to `1.21` rather than left as `normal` so the geometry survives a font fallback.

The chips carry Figma's cap-height trim (`text-box: trim-both cap alphabetic`);
where a browser doesn't support it, centring the 14.112px line box in the 24px
chip lands within half a pixel of the same result.

### The card mockups

The four mockups are the same renders the Short Portfolio ring uses, so they are
derived from `public/figma/Short Portfolio Mockups` rather than exported again:
TripMate #3, beBuy #1, Opseek, and Rasry #1. Each is centre-cropped from its
native 1.347 or 1.333 aspect to the card's 760 × 540 (1.4074) and written at
1520 × 1080 — 2× the display size, 235–365KB each.

### Known substitutions and design notes

- **All four cards' copy is verbatim from their frames** (read via the Desktop
  Bridge). The chip labels keep Figma's own characters — its casing is
  inconsistent (`UX Audit` vs `UX audit` vs `developer handoff`) but every chip
  renders through `uppercase`, exactly as Figma's `textCase: UPPER` does.
- **The pin has no lead-in.** The track's leading and trailing pads are both
  the frame's 200px margin, so the section is already in its designed layout
  when it arrives and simply starts moving — rather than sliding in from a
  wider resting offset.
- **Display face** — Feature Deck itself. The two title lines set at 469px and
  487px, the second filling the 487px box exactly as the frame does. A
  non-breaking space pins the `&` to `explorations`, which is where Figma breaks
  the line.
- **This is the one place the trial font shows.** Its 74-codepoint set has no
  `&`, so that character alone falls through to Times New Roman and sits lighter
  than the Feature Deck around it. A licensed cut fixes it with no code change.
- **Caption copy** is Inter at its display optical size, matching the frame's
  `Inter Display`.
- Two layers in the frame are hidden and are not shipped: a button under the
  title (`Frame 1000004521`), and a `Live Website` / `Behance Case Study` link
  pair under the tags (`Frame 1948759128`).
- The meta copy (year and tag chips) is standardized to `#575757` (from Figma's
  `#636363`, `Text/Body 1`) — see the About section's notes. It clears WCAG AA at
  both caption sizes — 6.34:1 on the `#f0f0f0` chips, 7.23:1 for the year on
  white.

### Responsive notes

- `lg` and up — the pinned track above.
- `< lg`, or `prefers-reduced-motion: reduce` — no pin: the title sits above the
  four cards in one full-width column, and the section scrolls normally.
- The title is fluid (`clamp(44px, 5.66vw, 80px)`) in the stacked layout; inside
  the track it is sized from `--work-card-w`, reaching its full 80px whenever the
  card is at 760px.
- The caption and the chips wrap rather than shrink, so the type keeps its exact
  Figma size at every width. The name row goes to two lines at 390px and the
  chips to two rows.

## My Specialist Field section

Built from the Figma frame `My Specialist Field` (`40003959-1931`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1931).
A 1600 × 1354 frame on pure black (`BG Color` = `#000000`, the same ground as
My Process), following the white Selected Work section.

| File | Role |
| --- | --- |
| `components/specialist/SpecialistSection.tsx` | Label and the six numbered service rows |

The section ships no assets — every element is type or a border.

### Layout

The frame keeps the 200px margins the hero and About share, so it is expressed
against the same 1200px content column (`max-w-[1248px] px-6`). The label sits
at that column's left edge; the `Services` block (x 445 → 1400, 955 × 890) is
flush with its right edge — 955 ÷ 1200 = 79.5833%.

Inside the block every measurement is a ratio of the service name's own size,
which is what the `--svc` custom property carries:

| Figma | ÷ 100 |
| --- | --- |
| Numeral column, 164px | 1.64 |
| Numeral, 24px | 0.24 |
| Name box, 75px | 0.75 |
| Row, 115px | 1.15 |
| Row gap, 40px | 0.4 |

`--svc` is in turn the content column ÷ 12 (`clamp(34px, calc(8.3333vw - 4px),
100px)`, since `px-6` takes 48px off the viewport and 1200 ÷ 12 = 100), so the
block scales as one piece and lands on the frame's exact geometry once the
column caps at 1200px — the section measures 1600 × 1354 there, with the rules
at y 379, 534, 689, 844, 999 and 1154.

Each row is a 75px box holding the numeral and the name, then 40px of clearance
down to the rule. Figma trims both text boxes to cap height / alphabetic
baseline, which puts their shared baseline on that box's bottom edge; pinning
the box to 0.75 keeps the baseline where the frame puts it even though the
substituted display face has a different cap height than Feature Deck. Every
name begins at x 164 — Figma's per-row `Service Name` frames only differ in
width because they hug a different name.

`Line 16` is a zero-height line sitting on the row's bottom edge, so it is
reproduced as a `border-b` inside a border-box height rather than as the
exported SVG; the six rows then measure the frame's exact 890px.

### Type

Taken verbatim from the frame. Letter spacing is written in `em` so it stays
exact at every size the clamp resolves to:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `My Specialist Field` | 24 / 24px (100%) | 0 |
| Row numeral | 24 / 24px (100%) | -0.48px (-0.02em) |
| Service name | 100 / 100px (100%) | -2px (-0.02em) |

Both row texts carry Figma's cap-height trim (`text-box: trim-both cap
alphabetic`), which is what produces the numeral's 17px box and the name's 75px
box on a shared baseline.

### Colour

- The label is `#d0de00` (`--color-accent`) at 14:1 on black, with `My ` at 48%
  of it — an effective `#646b00`, 3.6:1. That clears WCAG AA as large text at
  its 24px design size, so the label holds 24px at every width rather than
  stepping down with the rest of the section.
- The names are `Text/Body 2` (`--color-body-2`, `#a5a5a5`) at 90%, and the
  numerals are Figma's raw `#949494` (`--color-numeral`). Over black those are
  the same grey — 90% of `#a5a5a5` is exactly `#949494` — at 6.9:1.
- `Line 16` is `#fff` at 12%, the same rule spec the About section uses.

### Known substitutions and design notes

- **Display face** — Feature Deck itself. The longest name, *Mobile App
  Design*, sets at 757px against Figma's 760px.
- **Label and numerals** are Inter at its display optical size, matching the
  frame's `Inter Display`.
- **Every row hides an `Inner Service Chip`** — a 580 × 254 frame at x 102,
  y -79, overlapping the row above. It reads as a hover preview that is
  switched off, and the component set exposes no variant other than `Default`,
  so the rows ship as plain, non-interactive list items.
- A second hidden layer, `Frame 1948759134` ("Website Design" at x 563,
  y 1005), is also not shipped.
- The numerals are `aria-hidden` — the `<ol>` already carries the order.

### Responsive notes

- The type and the row rhythm are continuous from 320px up: because 955 ÷ 1200
  and 164 ÷ 955 resolve to the same fractions of the content column whether the
  block is inset or full width, nothing jumps at the breakpoint.
- `lg` and up — the frame's composition, the block inset to the column's right
  79.5833%, reaching its exact geometry at 1248px where the column caps.
- `< lg` — the block goes full width and the label sits above it.
- The names never wrap. `--svc` floors at 34px, which is the size at which the
  longest name still clears the numeral column at a 320px viewport.

## Customer Testimonial section

Built from the six sibling Figma frames `Lina M.` → `Mizanur Rahman`
(`40004024-1783`, `-1814`, `-1834`, `-1876`, `-1907`, `-1926`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40004024-1783),
which superseded the single `Customer Testimonial` frame (`40003959-1942`) the
section was first built from. Each is a 1600 × 1228 white frame showing the
same template with a different client selected; the section reproduces the set
as one interactive block. The heading, quote and name ride the site-wide
client-requested flattening of the frames' `#0C0C0C` to pure `#000000`
(`text-black`), described in the About and Selected Work notes.

| File | Role |
| --- | --- |
| `components/testimonial/TestimonialSection.tsx` | Title, quote, client info, the portrait switcher |
| `public/figma/testimonial/` | Portraits and per-client logos exported from the frames |

### Interaction

The six portraits are buttons. Clicking one selects that client: the quote,
name, role and logo swap, the clicked portrait becomes the frames' `Active`
variant (full opacity) and the rest drop to `Inactive` at 36% — exactly the
delta between any two of the six frames. The title never changes, which is the
one element the frames hold constant. State is one `useState` index in a
`"use client"` component; there is no carousel, no timer, no URL state.

Accessibility: each button carries `aria-pressed` and a `Show <name>'s
testimonial` label (the portrait image itself is decorative, `alt=""`), the
swapped content sits in an `aria-live="polite"` figure so the change is
announced without moving focus, and the inactive portraits raise to 60% on
hover/focus as an affordance the static frames don't need. That hover step and
the 200ms opacity fade are the only invented motion.

### Layout

The frames keep the 200px margins the hero, About and Specialist share, so the
section is expressed against the same 1200px content column
(`max-w-[1248px] px-6`). The title sits at that column's left edge; everything
else lives in one block (x 553 → 1400, 847 wide) flush with its right edge —
847 ÷ 1200 = 70.5833%, leaving 29.4167% of indent.

Vertical rhythm is pinned rather than scaled, the same way About is. The block
declares the frames' own first row height (`lg:grid-rows-[365px_auto]` — quote
at y 420, client info at y 785), so the info, the rule and the portraits hold
their positions while quote stacks of different heights swap above them:
across the six frames the stack runs 117px (Boris) to 250px (Mizanur), all
inside the 365px row, so switching never moves the layout at `lg` and up. Everything else
is the literal Figma value: 160px of vertical padding, 100px from the title to
the quote, 28px between the three info rows, 4px inside the name block, 20px
from the name to the logo.

At 1248px, where the column caps, that lands on the frames' own numbers: the
title at y 160 in a 160px box, the quote at y 420, the client info at y 785,
the rule at y 863 and the portraits at y 892 — 136.58 × 177.03 each, 5.5px
apart.

### Type

Taken verbatim from the frames:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `Hear From` / `People I've Helped` | 80 / 80px (100%) | -1.6px (-0.02em) |
| Quote, main paragraph | 28 / 39.2px (140%) | 0 |
| Quote, secondary paragraph | 24 / 31.2px (130%) | 0 |
| Client name | 20 / 24px (120%) | 0 |
| Client role | 18 / 21.6px (120%) | 0 |

The line heights are Figma percentages written as ratios (`1.4`, `1.3`, `1.2`)
so they stay exact at the responsive sizes; the title's 100% is written as
`1`. Only the title carries letter spacing — -1.6px ÷ 80px = -0.02em — and
every other run in the frames is tracked at 0.

The quote is a vertical auto-layout of one or two paragraphs, 32px apart.
Three frames carry a second paragraph — Nilio's is an intro (his small
paragraph comes first), Irfanul's and Mizanur's are closings — and the
secondary paragraph sets at 24 / 130% against the main one's 28 / 140%,
reproduced as spec'd rather than normalised. Within a paragraph Figma
alternates `Inter Display` Regular and **SemiBold** runs (up to four in
Boris's and Nilio's), rendered as one text flow with `<strong
class="font-semibold">` spans — the first build's single bold tail came from
the superseded frame.

### The portrait row

Six 136.584 × 177.053 portraits spread across the 847px block, which is what
produces the frames' 5.5px between them: each is 136.584 ÷ 847 = 16.126% of
the block and the gaps fall out of `justify-between`, so the row scales as one
piece.

The portrait image fills are identical in every frame and in both variants
(verified by image hash), so the six 2× exports with Figma's crops baked in
serve every state — only the opacity switches. Every portrait carries a
`Loader` hairline on its bottom edge — 1px of black at 40% over a 10px
backdrop blur — which the frames draw identically on both variants, so it
reads as a rule rather than as carousel progress. Mizanur's frame stacks a
duplicate `Active` portrait over his `Inactive` one (a hand-copy artefact,
slightly offset); the template's single-instance row is the intent and is what
ships.

### The logos

Each client's `Logo` is a 197 × 50 box with that client's artwork pinned to
its bottom-right corner at its own natural size — the box and pinning are the
template; only the artwork and its dimensions change. All five new marks are
SVG exports from the frames (Estater's was already in place):

| Client | Mark | Size |
| --- | --- | --- |
| Lina M. | Estater | 186 × 27.03 |
| Nilio Bagga | Samba Soccer Schools crest | 35 × 46.67 |
| Boris Lunoff | Dr. Badi — Weight Loss & Wellness | 119.47 × 41.4 |
| Md Irfanul Haque | Rasry | 137.58 × 30.4 |
| Md Jahid Hasan | AppleGadgets | 124 × 38.91 |
| Mizanur Rahman | Opseek | 126.55 × 32 |

The sizes are data, so they ride in the `style` prop rather than in class
names, which keeps Tailwind's scanner out of it.

### Known substitutions and design notes

- **Display face** — Feature Deck itself. The two title lines set at 350px and
  593px inside the 596px box.
- **Quote and caption** are Inter at its display optical size, matching the
  frames' `Inter Display`. The tallest stack (Mizanur's, 251px) sits inside
  the 365px row at the design width; web Inter breaks Nilio's main paragraph
  to four lines against the frame's three (the ~1% width variance noted in
  the other sections), which the pinned row absorbs.
- **Mizanur's quote is placeholder copy in Figma** — "I had a great experience
  working with Ashiq." repeated across both paragraphs, with an arbitrary
  SemiBold span (the closing paragraph even opens with a stray space, kept
  verbatim — CSS collapses it). It ships as the frame spells it; swap the runs
  in `TESTIMONIALS` when the real quote exists.
- The roles come from the frames' own `Info` text, which corrects three of the
  first build's portrait-name-derived guesses: Boris is `…at Dr. Badi`,
  Irfanul is `Founder at Rasry`, Jahid's separator is a pipe, and Mizanur is
  `Managing Director & CTO` under the on-screen name `Mizanur Rahman`.
- The role is standardized to `#575757` (from Figma's `#636363`,
  `Text/Body 1`) — see the About section's notes. On white it is 7.23:1, which
  clears WCAG AA at the role's 18px.

### Responsive notes

- `lg` and up — the frames' composition, the block inset to the content
  column's right 70.5833%, reaching its exact 1600 × 1229 geometry at 1248px
  and holding it above that. (The frames measure 1228; the 1px is the rule,
  which the frames draw as a zero-height line and the DOM as a real 1px
  `<hr>`.)
- `< lg` — the block goes full width under the title, the same stack the About
  and Work sections use. The portraits step up across that breakpoint (111px
  at `lg`, 157px just below it) because the block does.
- `< sm` — the name and the logo stack, so each wordmark keeps its designed
  size in a narrow column.
- The title is fluid (`clamp(40px, 6.4103vw, 80px)`), hitting its full 80px at
  1248px where the column caps. The quote steps 28 → 20px
  (`clamp(20px, 2.8vw, 28px)`) and Nilio's 24 → 18px
  (`clamp(18px, 2.4vw, 24px)`), both reaching the design size at 1000px. The
  name and role hold their exact 20px and 18px at every width.
- The portraits stay 16.126% of the block all the way down, reaching 44px —
  still a viable touch target — at 320px.

## Short Portfolio section

`components/short-portfolio/ShortPortfolioSection.tsx` — a drag-to-rotate 3D
ring of eleven project mockups, last on the page after the testimonial. This
section has no Figma frame; the brief was the showcase on
[naya-studio-dubai.webflow.io](https://naya-studio-dubai.webflow.io/): no
title, pure black ground, 160px of vertical breathing room at desktop, and
the site's own type and colour tokens. Because the canvas is cropped to the
content, that 160px padding is the whole visible gap — there is no dead render
inflating it.

### How the ring works

`PortfolioRing.tsx` (client) builds a WebGL cylinder of image planes with
plain `three` — no wrapper library. The camera sits at the world origin and
the ring's centre is pushed back by `radius + 0.06`, so the nearest slide
passes just in front of the lens: the far wall fills the frame while near
slides sweep past the screen edges. The radius derives from the content
(`slide width × gap × count ÷ 2π`), so slides can be added or removed
freely. Each plane is bowed with a parabola (`z = −0.2·(1 − u²)`) so
neighbours read as one continuous curved wall, corners are rounded by a
shared canvas `alphaMap`, and captions (name left in white, category right
in `Text/Body 2`) are canvas textures drawn with the site's real mono face,
curved along with their slide. A cursor-trailing `‹ DRAG ›` pill replaces
Naya's site-wide custom cursor, and a `linear-gradient` vignette dissolves
the flanks into the section's black.

### Fixes over the reference implementation

- Render loop and asset loading are gated by one `IntersectionObserver` —
  nothing initialises, loads, or draws until the section is near the
  viewport, and it stops off screen (Naya's spins for the life of the page).
- Motion is time-based, so the idle spin no longer doubles after the first
  drag and is frame-rate independent.
- The drag ripple (two summed sines displacing vertices near the ring's
  exit edge) runs in the vertex shader via `onBeforeCompile`, not per-vertex
  JavaScript; all materials share one program and one uniforms object.
- Drags use pointer capture, so releasing outside the canvas can't strand a
  drag; `prefers-reduced-motion` stops the idle spin; the ring is keyboard
  operable (focus + arrow keys, one slide per press).
- Caption textures render at 2048px with mipmaps and anisotropy (Naya's
  1440×200 canvases at a mismatched aspect render soft/stretched).
- The ring fades in once every texture has arrived instead of slide-by-slide
  pop-in, and everything is disposed on unmount.

### Content

The eleven slides are the renamed mockups from `public/figma/Short Portfolio
Mockups`, re-encoded to 1440px 4:3 webp in `public/figma/portfolio` (155MB of
sources → ~1MB of textures) via `sharp`. The order interleaves the four
projects — beBuy (5), TripMate (3), Rasry (2), Opseek (1) — so no two slides
of one project are adjacent, including across the ring's wrap-around seam.

### Responsive and accessibility notes

- `lg` and up — the WebGL ring, full bleed. The canvas shape is derived, not
  authored, and lives in `framing.ts` (a non-client module, because the
  section — a server component — needs `RING_EDGE_GAP_VW` as a real number;
  value imports from a `"use client"` module reach a server component as
  client-reference proxies). The horizontal frustum covers 3.45 slide widths
  so a card beside the centre one fits wholly in frame — corners and caption —
  before the vignette swallows it. The vertical frustum is a worst-case sweep
  over a full slide-step of rotation: every card point inside the horizontal
  window must also fit vertically, so cards only ever leave through the
  left/right edges under the vignette, never through the canvas's top or
  bottom (framing the far-wall card alone fails: cards nearing the frame edge
  are closer to the camera and project taller). The sweep leaves ~1.8vw of
  in-canvas slack around the far-wall card, and the section's `lg` paddings
  subtract exactly that (`160px − RING_EDGE_GAP_VW`vw), keeping the visual gap
  from section edge to the centre card at 160px at any zoom. The composition
  stays width-driven and resize is just a renderer resize.
- `CARD_SCALE` sets on-screen card size, and it trades against horizontal
  containment. A card's pixel width is `canvas width ÷ SLIDES_ACROSS`, so on a
  full-bleed canvas the only way to enlarge cards is a narrower frustum. At 1
  the frustum is exactly wide enough to hold a flanking card whole (24.8°
  against a 24.2° outer corner); every step above that pulls the edge in, so
  the card is genuinely cut by the frame and `RING_VIGNETTE` has to land that
  cut on already-black pixels. It currently runs at **1.5** — 626 × 470px
  cards at a 1440 viewport — with the heavier vignette ramp that requires.
  Naya's flat 85% edge suffices for their dark photographs; these bright
  laptop mockups read straight through it, which is why `VIGNETTE_STOPS`
  ramps earlier and finishes at solid black. The middle of that ramp is eased
  ~10 points lighter so departing cards stay readable — measured across
  rotation phases, the outer 3% holds at 5–6/255 (the cut stays invisible)
  while the 0.65–0.85 band sits near 113/255 against 226+ at the centre. The
  final stops are the one part that cannot be lightened: the frame cuts the
  card at the edge, so the gradient must be solid black by then.
- `< lg` — the wrapper is `display:none`, so the observer never fires and the
  WebGL path never runs; a scroll-snap strip of the same slides renders
  instead, captioned in the Selected Work meta pattern.
- Screen readers get one canonical visually-hidden list of `name — category`;
  the canvas region and the mobile strip are `aria-hidden`, and the ring
  region carries usage instructions in its label.

## Footer section

Built from the Figma frame `Footer` (`40003959-1985`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1985).
A 1600 × 1644 black frame that closes the page after the Short Portfolio ring.

| File | Role |
| --- | --- |
| `components/footer/FooterSection.tsx` | The four zones: contact header, booking, footer content, wordmark strip |
| `components/footer/CalBooking.tsx` | The live Cal.com inline embed |
| `components/footer/ScrollToTop.tsx` | The scroll-to-top pill + rotated label |
| `public/figma/footer/` | Assets exported from the frame |

### Layout

Four zones, pinned to the frame's vertical rhythm at `lg`: the contact header
at y 0 (the frame has no top padding — the Short Portfolio section above
provides the gap), the booking block 64px below it, the footer content 250px
below that, and the 210px wordmark strip 160px further down, flush with the
page's bottom edge. The header and footer content sit in the 1200px content
column the hero, About and Specialist share (`max-w-[1248px] px-6`); the
booking block keeps the frame's wider 160px margins — a 1280px column
(`max-w-[1328px] px-6`). At the column cap every x lands on the frame's own
numbers: nav columns at 824 / 1072 / 1320, stat blocks at 864 / 1004 / 1144 /
1284, the scroll-to-top at 1448.

The aurora background is the frame's image fill (CROP mode), baked to one
1600 × 1644 JPEG and pinned to the section's *bottom* at the frame's aspect,
so however tall the live Cal embed makes the section, the glow stays in
register with the wordmark that blends against it; extra height above fades
into the black the image opens with.

### Type

Taken verbatim from the frame. The display runs write Figma's 108% line
height as `leading-[1.08]` and the -2% tracking as `-0.02em`; everything set
in the real faces (Spline Sans Mono, Inter, Caveat) uses `line-height:
normal`, which resolves to the same metrics as Figma's *Auto*, plus the
cap-height trim (`text-box: trim-both cap alphabetic`) Figma applies:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `Not Getting Results?…` | 64 / 108% (69.12px) | -2% (-0.02em) |
| `Need Better UX?…` | 56 / 108% | -2% (-0.02em) |
| Stat label / column title / terms row | 14 / auto, cap-trimmed, uppercase | 0 |
| Stat number | 28 / auto, SemiBold | 0 |
| Nav link | 18 / auto, cap-trimmed | 0 |
| `Scroll to top` | 16 / auto, cap-trimmed | 0 |
| `Hire Your Next!` | 34 / 24px (Caveat) | 0 |

### Colour

- Both display titles and the stat labels carry Figma's vertical
  `#fff → #d2d2d2` linear as `bg-clip-text`; the labels at the fill's 72%.
- The stat numbers restate Figma's four-stop linear
  (`#f8fceb` 56% → `#867fef` → `#42f1eb` → `#d0de00`) in the element's own
  pixel space: the transform resolves to 202° with the stops at
  5.8 / 32.3 / 57.1 / 94.2% of the CSS gradient line over the 116px block.
- Muted runs are white at Figma's exact opacities: column titles and the
  `E.` / `P.` prefixes at 36%, the terms row (and its diamonds) at 48%.

### The Cal.com booking block

The frame mocks this zone as a static screenshot of Cal.com's dark booker
(`Screenshot 2026-07-05…`, 1280 × 602, radius 8). It ships as the real thing
instead: `@calcom/embed-react`'s inline embed on the `30min` namespace,
`calLink` `md-ashiqul-islam-1k4l0w/30min`, dark theme, `month_view` — so the
widget shows live availability rather than the mock's July 2026. The
container keeps the design's 8px radius and holds the 602px design height as
a minimum at `lg`; the widget's internal layout (a centred booker card, its
own mobile column view) is Cal's own.

### The wordmark strip

`Footer Visual Element` crops the giant "Design Partner" artwork at the
page's bottom edge. The strip is an `aspect-[1600/210]` stage with children
in percentages, so it scales as one piece at any width:

- **Design** — an image-masked word plus a 40% echo copy offset (6, 5).
  Baked to a 2× PNG of exactly the visible 753.89 × 139 crop.
- **Partner** — the frame's white vector, exported pre-clipped to its
  visible 811.7 × 138, restated live with Figma's OVERLAY blend so the
  aurora reads through it.
- **Hire Your Next!** — live Caveat text (34px → `2.125vw`), OVERLAY like
  the wordmark.

### Known substitutions and design notes

- **Typefaces** — Feature Deck and Inter's display optical size, as everywhere
  else; both are the frames' actual faces. **Caveat** is likewise the frame's
  actual face and ships as the `--font-script` token.
- **Figma gives none of the links a destination.** Only addresses derivable
  from the frame's own copy are real (`mailto:hello@ashiq.com`,
  `tel:+8801998591208`, WhatsApp via the listed number); Telegram, the four
  socials and Terms / Policy ship as `#` placeholders in the data constants
  at the top of `FooterSection.tsx`. The expertise column links to
  `#specialist`, whose services it mirrors.
- **One hidden layer** (`Frame 1948759158`, a 184.67 × 154 nav column) is
  not shipped.
- The scroll-to-top is functional — smooth scroll, `prefers-reduced-motion`
  aware — where Figma ships it as static decoration.

### Responsive notes

- `lg` and up — the frame's composition, reaching its exact geometry at the
  1248px column cap; the section measures the frame's 1644px whenever the
  embed stays within its 602px minimum.
- The scroll-to-top needs 46px beyond the capped column, so it shows once
  the viewport clears 1360px.
- `< lg` — the zones stack: stats in a 2 × 2 grid, nav in two columns with
  Social wrapping below, the embed in Cal's own single-column mobile layout.
- The titles are fluid (`clamp(40px, 5.1282vw, 64px)` and
  `clamp(36px, 4.4872vw, 56px)`), hitting their design sizes at 1248px; the
  mono and link runs hold their exact sizes at every width.
- The wordmark strip scales continuously — at 390px it is a 51px ribbon, at
  1600px the frame's exact 210px crop.
