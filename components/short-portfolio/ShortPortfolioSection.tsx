import Image from "next/image";
import PortfolioRing, {
  type RingSlide,
} from "@/components/short-portfolio/PortfolioRing";
import { RING_EDGE_GAP_VW } from "@/components/short-portfolio/framing";

/**
 * Short Portfolio — a drag-to-rotate 3D ring of project mockups, modelled on
 * naya-studio-dubai.webflow.io's showcase (see PortfolioRing for the geometry
 * and the list of its bugs fixed here).
 *
 * Per the brief: no section title, pure black ground, 160px of breathing room
 * top and bottom at desktop (the mobile step matches the other sections'
 * `py-24`). Slides are the eleven renamed mockups from
 * `public/figma/Short Portfolio Mockups`, re-encoded to 1440px webp in
 * `public/figma/portfolio` (155MB of sources → ~1MB of textures).
 *
 * The order interleaves the four projects so no two slides of the same
 * project sit next to each other — including across the ring's wrap-around
 * seam (beBuy has 5 of the 11 slides, so it takes every other slot).
 *
 * Three renditions of the same list share the SLIDES array:
 * - ≥ lg: the WebGL ring (aria-hidden canvas; drag / arrow keys).
 * - < lg: a scroll-snap strip (aria-hidden — it duplicates the list below).
 * - Screen readers: a visually-hidden list, the one canonical accessible copy.
 */

const SLIDES: (RingSlide & { alt: string })[] = [
  {
    src: "/figma/portfolio/bebuy-1.webp",
    name: "beBuy",
    category: "eCommerce",
    alt: "The beBuy eCommerce storefront shown on a laptop",
  },
  {
    src: "/figma/portfolio/tripmate-1.webp",
    name: "TripMate",
    category: "Travel",
    alt: "The TripMate travel platform shown on a laptop",
  },
  {
    src: "/figma/portfolio/bebuy-2.webp",
    name: "beBuy",
    category: "eCommerce",
    alt: "A beBuy product listing page shown on a laptop",
  },
  {
    src: "/figma/portfolio/rasry-1.webp",
    name: "Rasry",
    category: "Luxury Leather eCommerce",
    alt: "The Rasry luxury leather goods site shown on a laptop",
  },
  {
    src: "/figma/portfolio/bebuy-3.webp",
    name: "beBuy",
    category: "eCommerce",
    alt: "A beBuy product detail page shown on a laptop",
  },
  {
    src: "/figma/portfolio/tripmate-2.webp",
    name: "TripMate",
    category: "Travel",
    alt: "A TripMate trip planning screen shown on a laptop",
  },
  {
    src: "/figma/portfolio/bebuy-4.webp",
    name: "beBuy",
    category: "eCommerce",
    alt: "The beBuy checkout flow shown on a laptop",
  },
  {
    src: "/figma/portfolio/opseek-1.webp",
    name: "Opseek",
    category: "Digital Agency",
    alt: "The Opseek digital agency site on a laptop resting on an airplane tray table",
  },
  {
    src: "/figma/portfolio/bebuy-5.webp",
    name: "beBuy",
    category: "eCommerce",
    alt: "A beBuy category page shown on a laptop",
  },
  {
    src: "/figma/portfolio/tripmate-3.webp",
    name: "TripMate",
    category: "Travel",
    alt: "A TripMate destination page shown on a laptop",
  },
  {
    src: "/figma/portfolio/rasry-2.webp",
    name: "Rasry",
    category: "Luxury Leather eCommerce",
    alt: "The Rasry hero screen with its wordmark shown on a laptop",
  },
];

export default function ShortPortfolioSection() {
  return (
    <section
      id="short-portfolio"
      aria-label="Short portfolio"
      /*
       * The ring's frustum keeps vertical headroom inside the canvas so cards
       * never clip at its top or bottom edge (see VIEW_H in PortfolioRing).
       * That headroom is visually part of the gap, so at `lg` the paddings
       * give it back: padding + in-canvas slack = exactly 160px from the
       * section edge to the centre card and its caption.
       */
      style={
        {
          "--ring-pad": `max(0px, 160px - ${RING_EDGE_GAP_VW.toFixed(4)}vw)`,
        } as React.CSSProperties
      }
      className="bg-black py-24 lg:pt-[var(--ring-pad)] lg:pb-[var(--ring-pad)]"
    >
      {/* The one copy screen readers get, on every breakpoint. */}
      <ul className="sr-only">
        {SLIDES.map((slide) => (
          <li key={`${slide.src}-sr`}>
            {slide.name} — {slide.category}
          </li>
        ))}
      </ul>

      {/* ≥ lg — the WebGL ring, full bleed. */}
      <div aria-hidden className="w-full">
        <PortfolioRing
          slides={SLIDES.map(({ src, name, category }) => ({
            src,
            name,
            category,
          }))}
        />
      </div>

      {/*
        < lg — a scroll-snap strip of the same slides. The captions repeat the
        Selected Work meta pattern: mono uppercase, name in white, category in
        Text/Body 2 grey.
      */}
      <ul
        aria-hidden
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 lg:hidden"
      >
        {SLIDES.map((slide) => (
          <li key={slide.src} className="w-[78vw] shrink-0 snap-center sm:w-[52vw]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(min-width: 640px) 52vw, 78vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[12px] leading-[1.176] font-medium tracking-[-0.0084em] uppercase">
              <span>{slide.name}</span>
              <span className="text-body-2">{slide.category}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
