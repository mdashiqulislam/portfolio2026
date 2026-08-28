# Personal Website

Next.js 16 (App Router) + TypeScript + Tailwind v4.

```bash
npm run dev
```

## Hero section

Built from the Figma frame `Hero Section` (`40003898-1075`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003898-1075).

| File | Role |
| --- | --- |
| `components/hero/HeroSection.tsx` | Layout, headline, stats, background artwork |
| `components/hero/TopNav.tsx` | Logo + Let's Talk / Menu |
| `components/hero/CustomerLogos.tsx` | "Trusted by" logo rail |
| `components/hero/MaskedLogo.tsx` | Renders a logo as a fill clipped by its artwork |
| `components/effects/ParticleHand.tsx` | Interactive Three.js particle version of the hand artwork |
| `components/effects/ParticleField.tsx` | Generic drifting starfield (preview at `/lab/particles`) |
| `public/figma/` | Assets exported from the frame |

### Particle hand

The hand in the hero is a live particle system (inspired by usta.agency): the
bright pixels of `hero-bg.png`'s hand region are sampled at load and rebuilt as
~4,500 glowing points, with a black occluder layer hiding the raster hand
underneath. Hovering repels nearby particles; they spring back on leave.
Failure modes all degrade to the static image (no WebGL, sampling error, image
load failure), and `prefers-reduced-motion` renders a single static frame.

Design tokens (`--color-ink`, `--color-accent`, `--color-muted`, …) live in the
`@theme` block in `app/globals.css`.

### Known substitution

The headline in Figma uses **Feature Deck Trial**, a licensed trial face that
can't be shipped. It's rendered here in **Instrument Serif** (Google Fonts) as
the closest free high-contrast display serif. To swap it, change the single
`display` font import in `app/layout.tsx` — everything else reads it through the
`--font-display` token.

### Responsive notes

The frame only specifies a 1600 × 1081 desktop layout. Below that:

- `< sm` — the "Let's Talk" button is hidden, leaving Menu as the entry point.
- `< lg` — a scrim behind the stats and positioning statement keeps them legible
  over the artwork, and the stats wrap to two rows.
- `< lg` — the logo rail becomes a horizontal scroller. At `lg` and up it is
  centre-clipped, matching the design's intentional 1664px bleed.

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

### Known substitutions and design notes

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap as the
  hero. Instrument Serif is narrower, so the statement sets in four lines where
  Figma shows five.
- **`Inter Display` → `Inter`** for the body copy, which sets in five lines where
  Figma shows four. Adding the `opsz` axis to the `Inter` import in
  `app/layout.tsx` would close most of that gap, at the cost of also changing how
  the hero renders.
- **The divider is invisible by design.** `Frame 1948759103` specs its 1278px
  rule as `#fff` at 12% opacity, which reads as a leftover from the dark hero —
  on this section's white ground only the small `#D8D8D8` cross mark at x 1188
  shows. Reproduced as spec'd; `border-black/12` in `AboutSection.tsx` reveals
  it.
- **`My Photo` has a dead layer.** Its lower fill is a screenshot of an unrelated
  website, fully occluded by the opaque portrait above it, so it is not shipped.
- The `#808080` label and body copy clear WCAG AA against white at 24px (large
  text) but not at 14px — the section title sits at 3.95:1.

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
| `components/process/ProcessSection.tsx` | Title, the six tilted step cards, badges |

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
| Card title | 36 / 44px | 0 |
| Badge number | 14 / 17px | 0 |

Figma sets those three card line heights to *Auto* and lays the frame out from
the rounded results (19 + 28 + 44 + 48 = 139px, the height of every card). They
are written here as ratios — `leading-[1.1875]`, `leading-[calc(44/36)]` — so
the same proportions survive the smaller mobile sizes.

### Known substitutions

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap as
  the hero and About sections. Instrument Serif is much narrower: the title sets
  at 492px against Figma's 641px.
- **`Inter Display` → `Inter`** for the card copy. `next/font/google` requests
  only the `wght` axis, so Inter renders at its text optical size and the cards
  come out ~7% wider than Figma (e.g. *Research & Wireframe* 444px vs 413px).
  The composition absorbs it — cards grow rightwards from their pinned corner
  and the cluster still fits — but adding `axes: ["opsz"]` to the `Inter` import
  in `app/layout.tsx` would close most of the gap, at the cost of also changing
  how the hero and About sections render.

### Responsive notes

- `lg` and up — the frame's exact composition, 1:1. `lg` (1024px) is the lowest
  width that fits it: the cluster measures 944px once the wider face is applied,
  leaving 26px on each side.
- `< lg` — the cards stack into a centred column, keeping their tilt at a
  shallower ±5° so the rotated boxes still clear the viewport.
- The card title steps 36 → 32 → 26px and the label 16 → 14px, so titles stay on
  one line down to 390px. At 320px the three longest wrap to two lines.
- The section title is fluid (`clamp(48px, 13vw, 140px)`), reaching its full
  140px at the `lg` breakpoint.

## Selected Work section

Built from the Figma frame `Work` (`40003959-1707`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1707).
A 1600 × 938 white frame that follows the black Process section.

| File | Role |
| --- | --- |
| `components/work/WorkSection.tsx` | Title, project mockup, caption, tag chips |
| `public/figma/work/` | Assets exported from the frame |

### Layout

The frame keeps 120px margins — a 1360px content column, wider than the 1200px
one the hero and About share — and splits it in two: a 487px title box on the
left and a 760px project block on the right, with a 113px gutter.

Both columns are centred on the frame's own mid-line (the 160px title box and
the 618px project block share centre y 469), so `items-center` places them
without either being positioned absolutely. The column widths are percentages
of the 1360px column (487 ÷ 1360 = 35.8088%, 760 ÷ 1360 = 55.8824%) and the
gutter falls out of `justify-between`, so the composition scales as one piece
between `lg` and the 1600px design width. Everything else is the literal Figma
value: 160px of vertical padding, 16px from mockup to caption, 14px between the
caption rows, 8px inside the project name, 6px between chips.

The projects are a list, so a second row is a data change rather than a layout
one — the frame specifies one.

### Type

Taken verbatim from the frame. Letter spacing is written in `em` so it stays
exact at the smaller responsive sizes:

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

### The project mockup

`Project Hero Mockup` is three layers in Figma — a 180°-rotated background fill,
a vector at `mix-blend-overlay`, and the laptop render on top — over 3840 × 2160
and 4096 × 2731 sources. They are flattened to one 1520 × 1080 export
(`nexrank-mockup.jpg`): 2× the 760 × 540 display size, and ~357KB against 7.7MB
of originals. The flatten was rendered from the frame's own layer transforms and
checked against Figma's own render of the same node.

### Known substitutions and design notes

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap as
  the hero, About and Process sections. Instrument Serif is much narrower: the
  two title lines set at 354px and 379px inside the 487px box that Feature Deck
  fills. A non-breaking space keeps the `&` with `explorations`, which is where
  Figma breaks the line; without it the narrower face pulls the `&` up onto the
  first line.
- **`Inter Display` → `Inter`** for the caption, which renders ~7% wider — the
  name row measures 405px against Figma's 376px. Nothing moves as a result,
  since the year is placed by `justify-between`.
- **The title sits 1px low in Figma** — its box centres on y 470 while the
  project block centres on y 469. Reproduced as a true centre rather than
  carrying the 1px.
- Two layers in the frame are hidden and are not shipped: a button under the
  title (`Frame 1000004521`), and a `Live Website` / `Behance Case Study` link
  pair under the tags (`Frame 1948759128`).
- `#636363` clears WCAG AA at both caption sizes — 5.3:1 on the `#f0f0f0`
  chips, 6:1 for the year on white.

### Responsive notes

- `lg` and up — the frame's two-column composition, scaling as one piece and
  reaching its exact 1600 × 938 geometry at 1408px.
- `< lg` — the columns stack: title above, project below, both full width.
- The title is fluid (`clamp(44px, 5.66vw, 80px)`), hitting its full 80px at
  1408px, where the content column reaches its 1360px cap.
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

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap as
  the hero, About, Process and Work sections. Instrument Serif is much
  narrower: the longest name, *Mobile App Design*, sets at 594px against
  Figma's 760px, so the names stop short of the rule's right end. Nothing
  moves, because every name is anchored at x 164 rather than to the block's
  right edge.
- **`Inter Display` → `Inter`** for the label and the numerals.
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

Built from the Figma frame `Customer Testimonial` (`40003959-1942`) in the
[Website file](https://www.figma.com/design/k4xePsgNWqGT8zWcWGY3a4/Website?node-id=40003959-1942).
A 1600 × 1229 white frame that closes the page after the black My Specialist
Field section.

| File | Role |
| --- | --- |
| `components/testimonial/TestimonialSection.tsx` | Title, quote, client info, portrait row |
| `public/figma/testimonial/` | Assets exported from the frame |

### Layout

The frame keeps the 200px margins the hero, About and Specialist share, so it
is expressed against the same 1200px content column (`max-w-[1248px] px-6`).
The title sits at that column's left edge; everything else lives in one block
(x 553 → 1400, 847 wide) flush with its right edge — 847 ÷ 1200 = 70.5833%,
leaving 29.4167% of indent.

Vertical rhythm is pinned rather than scaled, the same way About is. The block
declares the frame's own first row height (`lg:grid-rows-[365px_auto]` — quote
at y 420, client info at y 785), so the info, the rule and the portraits stay
where the frame puts them even though the substituted faces wrap the quote to a
different number of lines than Figma does. A longer quote spills into the 173px
of slack under it instead of pushing everything below it down. Everything else
is the literal Figma value: 160px of vertical padding, 100px from the title to
the quote, 28px between the three info rows, 4px inside the name block, 20px
from the name to the logo.

At 1248px, where the column caps, that lands on the frame's own numbers: the
section measures 1229px, the title sits at y 160 in a 160px box, the quote at
y 420, the client info at y 785, the rule at y 863 and the portraits at y 892 —
136.58 × 177.03 each, 5.5px apart.

### Type

Taken verbatim from the frame:

| Element | Size / line height | Letter spacing |
| --- | --- | --- |
| `Hear From` / `People I've Helped` | 80 / 80px (100%) | -1.6px (-0.02em) |
| Quote | 32 / 38.4px (120%) | 0 |
| Client name | 20 / 24px (120%) | 0 |
| Client role | 18 / 21.6px (120%) | 0 |

The three body runs share Figma's 120% line height, written as the ratio `1.2`
so it stays exact at the responsive sizes; the title's 100% is written as `1`.
Only the title carries letter spacing, and it is written in `em` for the same
reason — -1.6px ÷ 80px is -0.02em. Every other run in the frame is tracked at 0.

Figma sets the quote as a single paragraph with its second half in Bold, so it
is one text flow with a `<strong>` rather than two blocks.

### The portrait row

Six 136.584 × 177.053 portraits spread across the 847px block, which is what
produces the frame's 5.5px between them: each is 136.584 ÷ 847 = 16.126% of the
block and the gaps fall out of `justify-between`, so the row scales as one
piece.

Figma frames two of the six with its own crop transform rather than a plain
cover fit — Md Irfanul Haque at 343.88% / 391.42% offset -142.23% / -123.35%,
Nilio Bagga at 308.1% / 237.67% offset -103.69% / -75%. Rather than reproduce
those transforms in CSS over 1388 × 2048 and 1600 × 1600 sources, all six are
exported with the frame's own crop baked in at 2× the display box (273 × 354),
which is 21–35KB each against ~4MB of originals.

Lina M. is the frame's `Active` variant and the other five are `Inactive` at
36%, which is what marks her quote as the one on screen. Every portrait carries
a `Loader` hairline on its bottom edge — 1px of black at 40% over a 10px
backdrop blur — which the frame draws identically on both variants, so it reads
as a rule rather than as carousel progress.

### Known substitutions and design notes

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap as
  every other section. Instrument Serif is much narrower: the two title lines
  set at 272px and 465px inside the 596px box Feature Deck fills.
- **`Inter Display` → `Inter`** for the quote and the caption. The quote still
  breaks to the frame's five lines at the design width — 191.95px against
  Figma's 192px — so the pinned row absorbs nothing there; at `lg` it runs to
  six lines (230px) and still clears the 365px row.
- **Only one testimonial is spelled out.** The other five people are named on
  their portrait components in Figma but carry no quote and no logo, so the row
  ships as a static, non-interactive list rather than a carousel — inventing
  the missing quotes is not an option. Their names and roles (read off those
  component names, which is the only place Figma records them) are on the
  portraits' `alt` text. A second testimonial is a data change: give the person
  a quote and the active portrait follows.
- `#636363` (`Text/Body 1`) on white is 6:1, which clears WCAG AA at the role's
  18px.

### Responsive notes

- `lg` and up — the frame's composition, the block inset to the content
  column's right 70.5833%, reaching its exact 1600 × 1229 geometry at 1248px
  and holding it above that.
- `< lg` — the block goes full width under the title, the same stack the About
  and Work sections use. The portraits step up across that breakpoint (111px at
  `lg`, 157px just below it) because the block does.
- `< sm` — the name and the logo stack, so the 186px Estater wordmark keeps its
  designed size in a narrow column.
- The title is fluid (`clamp(40px, 6.4103vw, 80px)`), hitting its full 80px at
  1248px where the column caps, and the quote steps 32 → 22px
  (`clamp(22px, 3.2vw, 32px)`). The name and role hold their exact 20px and
  18px at every width.
- The portraits stay 16.126% of the block all the way down, reaching 44px at
  320px.

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

- **Display face** — the same `Feature Deck Trial` → Instrument Serif swap
  as every other section, and **`Inter Display` → `Inter`** for the body
  runs. **Caveat is the frame's actual face** and ships as the new
  `--font-script` token.
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
