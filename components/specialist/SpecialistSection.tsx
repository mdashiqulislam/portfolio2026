"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import ServiceChips, { type Chip } from "./ServiceChips";

/**
 * My Specialist Field — Figma frame `My Specialist Field` (40003959-1931),
 * 1600 × 1354.
 *
 * A pure-black frame (`BG Color` = `#000000`, the same ground as My Process):
 * an accent label at y 160, then a right-aligned stack of six numbered service
 * rows at y 264.
 *
 * The frame keeps the 200px margins the hero and About share, so everything is
 * expressed against the same 1200px content column (`max-w-[1248px] px-6`).
 * The `Services` block (x 445 → 1400, 955 wide) is flush with that column's
 * right edge — 955 ÷ 1200 = 79.5833%.
 *
 * Every other measurement in the block is a ratio of the service name's own
 * size, which is what `--svc` carries: at the frame's 100px the numbers are
 * 24px (0.24), their column is 164px (1.64), the name box is 75px (0.75), the
 * row is 115px (1.15) and the rows are 40px apart (0.4). `--svc` is in turn
 * 1/12 of the content column, so the whole composition scales as one piece and
 * lands on the frame's exact geometry once the column caps at 1200px — the
 * section measures 1354px there. Below `lg` only the block's own width
 * changes, and because 955 ÷ 1200 and 164 ÷ 955 resolve to the same fractions
 * of the column either way, the type scales straight through the breakpoint.
 *
 * Type is taken verbatim from the frame — see the table in README.md. Letter
 * spacing is written in `em` (-0.48px ÷ 24px and -2px ÷ 100px are both
 * -0.02em) so it stays exact at every size the clamp resolves to.
 */

type Service = {
  /** Figma's own numbering, rendered as typed. */
  n: string;
  name: string;
  /**
   * The row's hover cloud, from its `Hover - …` frame (40004041-2749). Two to
   * five chips per row, each placed by the frame's own row coordinates.
   */
  chips: Chip[];
};

const YELLOW = "var(--color-chip-yellow)";
const LAVENDER = "var(--color-chip-lavender)";
const MINT = "var(--color-chip-mint)";
const CORAL = "var(--color-chip-coral)";
const PINK = "var(--color-chip-pink)";

const SERVICES: Service[] = [
  {
    n: "01",
    name: "UX Audit",
    chips: [
      { label: "Website UX Audit", color: YELLOW, x: 1.02, y: -0.43 },
      { label: "Landing Page UX Audit", color: LAVENDER, x: 2.25, y: 1.23 },
      { label: "Web App UX Audit", color: MINT, x: 4.42, y: -0.71 },
      { label: "Mobile App UX Audit", color: CORAL, x: 5.25, y: 0.74 },
    ],
  },
  {
    n: "02",
    name: "UIUX Design",
    chips: [
      { label: "AI Build Product Design", color: YELLOW, x: 1.5, y: -0.43 },
      { label: "Marketing Website Design", color: LAVENDER, x: 6.25, y: 1.23 },
      { label: "CRO Focused Design", color: MINT, x: 4.42, y: -1.01 },
      { label: "Services Website Design", color: PINK, x: 3.35, y: 0.74 },
      { label: "eCommerce Website Design", color: CORAL, x: 6.95, y: -0.46 },
    ],
  },
  {
    n: "03",
    name: "Website Design",
    chips: [
      { label: "Website Redesign", color: YELLOW, x: 3.8, y: -0.63 },
      { label: "MVP Website Design", color: LAVENDER, x: 1.95, y: 1.04 },
      { label: "Landing Page Design", color: CORAL, x: 6.95, y: 0.64 },
    ],
  },
  {
    n: "04",
    name: "Mobile App Design",
    chips: [
      { label: "App Redesign", color: MINT, x: 2.5, y: -0.43 },
      { label: "MVP App Design", color: PINK, x: 6.15, y: 1.14 },
    ],
  },
  {
    n: "05",
    name: "Web App Design",
    chips: [
      { label: "Web App Redesign", color: LAVENDER, x: 4.8, y: -0.73 },
      { label: "MVP Web App Design", color: YELLOW, x: 2.05, y: 1.14 },
    ],
  },
  {
    n: "06",
    name: "Marketing Design",
    chips: [
      { label: "Pitch Deck Design", color: MINT, x: 2.1, y: -0.73 },
      { label: "Company Deck Design", color: PINK, x: 3.55, y: 1.24 },
      { label: "Motion Graphics & Animation", color: CORAL, x: 7.65, y: -0.86 },
    ],
  },
];

export default function SpecialistSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="specialist"
      aria-labelledby="specialist-label"
      className="overflow-x-clip bg-black pt-24 pb-24 lg:pt-[160px] lg:pb-[200px]"
    >
      <div className="mx-auto w-full max-w-[1248px] px-6">
        {/*
          `My Specialist Field` (40003959:1932) — 24 / 24px (100%), tracking 0.
          Figma splits the fill: `My ` is the accent at 48%, the rest is solid.
          It holds its 24px at every width — the dimmed `My ` is 3.6:1 on black,
          which clears WCAG AA as large text at 24px but not a step below it.
        */}
        <h2
          id="specialist-label"
          className="font-sans text-[24px] leading-[1] font-medium text-accent"
        >
          <span className="text-accent/48">My </span>Specialist Field
        </h2>

        {/*
          `Services` (40003959:1935). The clamp is the content column ÷ 12
          (`px-6` takes 48px off the viewport, and 1200 ÷ 12 = 100), held at
          the frame's 100px once the column caps and floored so the longest
          name still clears the numeral column at 320px.
        */}
        <ol
          style={
            { "--svc": "clamp(34px, calc(8.3333vw - 4px), 100px)" } as CSSProperties
          }
          className="mt-12 flex flex-col gap-[calc(var(--svc)*0.4)] lg:mt-[80px] lg:ml-[20.4167%] lg:w-[79.5833%]"
        >
          {SERVICES.map((service, index) => (
            /*
              One `Service Name` row — 115px at the design width, with `Line 16`
              (`#fff` at 12%, reproduced as a border rather than the exported
              SVG) sitting inside that height on the row's bottom edge, exactly
              where Figma's zero-height line sits.
            */
            <li
              key={service.n}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={`relative h-[calc(var(--svc)*1.15)] border-b border-white/12 ${
                hovered === index ? "z-10" : ""
              }`}
            >
              <ServiceChips chips={service.chips} active={hovered === index} />
              {/*
                Figma bottom-aligns the number and the name and trims both text
                boxes to cap height / alphabetic baseline, which puts their
                shared baseline on this box's bottom edge — y 75 in the row.
                Pinning the box keeps that baseline where the frame puts it even
                though the substituted display face has a different cap height
                than Feature Deck.
              */}
              <div className="flex h-[calc(var(--svc)*0.75)] items-end">
                {/*
                  24 / 24px (100%), tracking -0.48px, in the 164px column that
                  sets where every name begins. The order is already carried by
                  the list, so the numeral itself is decorative.
                */}
                <span
                  aria-hidden
                  className={`w-[calc(var(--svc)*1.64)] shrink-0 font-sans text-[length:max(14px,calc(var(--svc)*0.24))] leading-[1] font-medium tracking-[-0.02em] transition-colors duration-300 ease-out [text-box:trim-both_cap_alphabetic] ${
                    hovered === index ? "text-accent" : "text-numeral"
                  }`}
                >
                  {service.n}
                </span>

                {/*
                  100 / 100px (100%), tracking -2px, `Text/Body 2` at 90% —
                  and pure white on hover, which with the numeral's switch to
                  the accent is the whole of the frames' row treatment.
                */}
                <span
                  className={`font-display text-[length:var(--svc)] leading-[1] tracking-[-0.02em] transition-colors duration-300 ease-out [text-box:trim-both_cap_alphabetic] ${
                    hovered === index ? "text-white" : "text-body-2/90"
                  }`}
                >
                  {service.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
