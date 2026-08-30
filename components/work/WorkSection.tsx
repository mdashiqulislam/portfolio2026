"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ChromaDistort from "@/components/effects/ChromaDistort";

/**
 * Selected Work — Figma frame `Work` (40003959-1707), plus the four project
 * cards (40004036-2450 / 2484 / 2520 / 2553).
 *
 * The section pins itself for the length of one horizontal track. The track is
 * the display title followed by the four cards; scrolling down slides it left,
 * so the visitor reads the projects across before the page continues. At rest
 * the track is the `1st` frame exactly — title at the 200px left margin, the
 * first card beside it — and it comes to a stop on that same margin once the
 * last card has arrived.
 *
 * The pin is a `lg`-and-up, motion-safe enhancement declared entirely in
 * `app/globals.css`; the markup below is an ordinary vertical stack, which is
 * what the server renders and what narrow or reduced-motion visitors keep. The
 * script only measures the track and writes the transform.
 *
 * Type is taken verbatim from the frame — see the table in README.md. Letter
 * spacing is written in `em` (-1.6px ÷ 80px = -0.02em, -0.8px ÷ 20px =
 * -0.04em, -0.56px ÷ 14px = -0.04em, -0.1008px ÷ 12px = -0.0084em) so it stays
 * exact at every size the title and cards take.
 */

type Project = {
  /** Client or product name. */
  name: string;
  /** What was delivered. */
  title: string;
  year: string;
  tags: string[];
  image: string;
  imageAlt: string;
};

const PROJECTS: Project[] = [
  {
    name: "TripMate",
    title: "AI Powered Trip Booking Experience",
    year: "2026",
    tags: ["UX-design", "UX Audit", "Website design"],
    image: "/figma/work/tripmate-mockup.jpg",
    imageAlt:
      "The TripMate travel platform on a laptop standing on an iridescent glass plinth against a blue sky",
  },
  {
    name: "beBuy",
    title: "AI Powered Multi-purpose eCommerce Website",
    year: "2026",
    tags: [
      "User Interview",
      "Customer Support Interview",
      "UIUX Design",
      "UX Audit",
    ],
    image: "/figma/work/bebuy-mockup.jpg",
    imageAlt:
      "The beBuy storefront on a desktop display on a wooden desk beside a potted plant",
  },
  {
    name: "Opseek",
    title: "UIUX Design and Development Agency",
    year: "2026",
    tags: ["UIUX design", "UX audit", "developer handoff"],
    image: "/figma/work/opseek-mockup.jpg",
    imageAlt:
      "The Opseek digital agency site on a laptop resting on an airplane tray table",
  },
  {
    name: "Rasry",
    title: "Luxury Handcraft Leather eCommerce Website",
    year: "2026",
    tags: ["UI-design", "UX Audit", "developer handoff"],
    image: "/figma/work/rasry-mockup.jpg",
    imageAlt:
      "The Rasry luxury leather goods site on a laptop against a pale grey wall",
  },
];

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // The same condition the stylesheet uses to switch the pin on.
    const pinned = window.matchMedia(
      "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
    );

    let travel = 0;
    let frame = 0;

    const draw = () => {
      frame = 0;
      if (travel <= 0) return;
      const progress = Math.min(
        1,
        Math.max(0, -section.getBoundingClientRect().top / travel),
      );
      track.style.transform = `translate3d(${(-progress * travel).toFixed(2)}px,0,0)`;
    };

    const measure = () => {
      if (!pinned.matches) {
        travel = 0;
        section.style.removeProperty("--work-travel");
        track.style.removeProperty("transform");
        return;
      }
      // How far the track overhangs the viewport is exactly how far it has to
      // move, and — since the section is that much taller than the viewport —
      // exactly how far the visitor scrolls to move it.
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--work-travel", `${travel}px`);
      if (travel <= 0) track.style.removeProperty("transform");
      draw();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    pinned.addEventListener("change", measure);
    // Catches the track settling as the display face finishes loading.
    const resize = new ResizeObserver(measure);
    resize.observe(track);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      pinned.removeEventListener("change", measure);
      resize.disconnect();
    };
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-title"
      className="work-pin relative bg-white py-24 text-black"
    >
      <div className="work-sticky">
        <div ref={trackRef} className="work-track px-6">
          {/*
            `Title` (40003959:1711) — 80 / 80px (100%), tracking -1.6px, centred
            and set in Figma's `capitalize` text case, in a 487 × 160 box.
          */}
          <h2
            id="work-title"
            className="work-title w-full text-center font-display text-[clamp(44px,5.66vw,80px)] leading-[1] tracking-[-0.02em] capitalize"
          >
            {/*
              A non-breaking space keeps the ampersand with `explorations`,
              which is where Figma breaks the two lines. Feature Deck is wide
              enough that the break falls there on its own; Instrument Serif is
              narrow enough to pull the `&` up onto the first line without it.
            */}
            Selected work &amp;&nbsp;explorations
          </h2>

          <ul className="work-list">
            {PROJECTS.map((project) => (
              /* `Frame 1948759190` — the project block, 16px above its meta. */
              <li
                key={project.name}
                className="work-card flex w-full shrink-0 flex-col gap-[16px]"
              >
                {/*
                  `Project Hero Mockup` — 760 × 540. In Figma each of these is
                  several layers over a blend mode; they are flattened to one
                  2× export, which is what the frame renders.
                */}
                <div
                  data-chroma-distort
                  className="relative aspect-[760/540] w-full overflow-hidden"
                >
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 760px, calc(100vw - 48px)"
                    className="object-cover"
                  />
                </div>

                {/* `Frame 1948759132` — the caption, 14px between its two rows. */}
                <div className="flex flex-col gap-[14px]">
                  {/*
                    Below `sm` the caption stacks — name, title, year — rather
                    than wrapping, which would leave the hairline dangling at
                    the end of a line.
                  */}
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/*
                      `Frame 1948759130` — name, hairline, title at 8px apart.
                      20 / auto, tracking -0.8px. Figma's Auto line height is
                      the face's own 1.21, which is what makes these 24px
                      boxes; it is pinned so the geometry survives a fallback.
                    */}
                    <h3 className="flex flex-col items-start gap-1 font-sans text-[20px] leading-[1.21] font-medium tracking-[-0.04em] sm:flex-row sm:items-center sm:gap-[8px]">
                      <span className="lg:whitespace-nowrap">
                        {project.name}
                      </span>
                      {/* `Line 23` — a 16px rule, #0C0C0C at 20%. */}
                      <span
                        aria-hidden
                        className="hidden h-[16px] w-px shrink-0 bg-black/20 sm:block"
                      />
                      <span className="lg:whitespace-nowrap">
                        {project.title}
                      </span>
                    </h3>

                    {/* 14 / auto, tracking -0.56px, `Text/Body 1`. */}
                    <time
                      dateTime={project.year}
                      className="shrink-0 font-sans text-[14px] leading-[1.21] font-medium tracking-[-0.04em] text-body"
                    >
                      {project.year}
                    </time>
                  </div>

                  {/* `Frame 1948759129` — the tag chips, 6px apart. */}
                  <ul className="flex flex-wrap items-center gap-[6px]">
                    {project.tags.map((tag) => (
                      /*
                        `Container` — 24px tall, 12px of side padding, 4px
                        radius, filled `Text/Body 3`. The label is 12 /
                        14.112px (= 1.176), tracking -0.1008px, uppercase, and
                        Figma trims the box to the cap height — `text-box` does
                        the same where it is supported, and centring is within
                        half a pixel of it where it is not.
                      */
                      <li
                        key={tag}
                        className="flex h-[24px] items-center justify-center rounded-[4px] bg-chip px-[12px] font-mono text-[12px] leading-[1.176] font-medium tracking-[-0.0084em] text-body uppercase [text-box:trim-both_cap_alphabetic]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cursor distortion on the card images — see ChromaDistort. */}
      <ChromaDistort scope="#work" />
    </section>
  );
}
