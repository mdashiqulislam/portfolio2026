import type { CSSProperties } from "react";

/**
 * My Process — Figma frame `My Process Section` (40003959-1675), 1600 × 1287.
 *
 * A pure-black frame: the display title at y 160, then six tilted cards
 * scattered across a 916.006 × 714.771 cluster that Figma centres in the frame
 * (x 342 → 1258.006, y 412 → 1126.771).
 *
 * Because the cluster is fixed-size artwork rather than a fluid column, it is
 * reproduced at 1:1 from `lg` up — no scaling — so every measurement below is
 * the literal Figma value. Below `lg` the cards stack into a single column,
 * keeping their tilt at a shallower angle so they still fit the viewport.
 */

type Step = {
  n: number;
  label: string;
  title: string;
  /** Badge fill. */
  color: string;
  /** Tilt direction. Every card in the frame is rotated ±12°. */
  tilt: "1" | "-1";
  /**
   * The card's un-rotated top-left corner inside the cluster — the frame
   * coordinate minus the cluster origin (342, 412). Figma rotates about that
   * same corner, which is why the cards carry `origin-top-left`.
   */
  x: number;
  y: number;
  /** Figma paint order: the frame stacks the cards 1, 5, 3, 2, 6, 4 back to front. */
  z: number;
};

const STEPS: Step[] = [
  {
    n: 1,
    label: "Every project starts with trust",
    title: "Discovery Call",
    color: "var(--color-step-1)",
    tilt: "-1",
    x: 72,
    y: 59.879,
    z: 1,
  },
  {
    n: 2,
    label: "Aligned before we begin",
    title: "Finalize Scope",
    color: "var(--color-step-2)",
    tilt: "-1",
    x: 517,
    y: 90.297,
    z: 4,
  },
  {
    n: 3,
    label: "Ideas backed by insight",
    title: "Research & Wireframe",
    color: "var(--color-step-3)",
    tilt: "1",
    x: 262.898,
    y: 160,
    z: 3,
  },
  {
    n: 4,
    label: "Let’s get creative",
    title: "Visual Design",
    color: "var(--color-step-4)",
    tilt: "-1",
    x: 0,
    y: 359.383,
    z: 6,
  },
  {
    n: 5,
    label: "Refined together",
    title: "Feedback & Revisions",
    color: "var(--color-step-5)",
    tilt: "-1",
    x: 489,
    y: 413.617,
    z: 2,
  },
  {
    n: 6,
    label: "This is not the end",
    title: "Handoff & Support",
    color: "var(--color-step-6)",
    tilt: "1",
    x: 288.9,
    y: 505,
    z: 5,
  },
];

export default function ProcessSection() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="overflow-hidden bg-black pt-24 pb-24 lg:pt-[160px] lg:pb-[160.23px]"
    >
      {/*
        `Section Title: My Process` — 140px, line height 140px (100%),
        letter spacing -2.8px (-0.02em). The frame centres it on x 800.
      */}
      <h2
        id="process-title"
        className="px-6 text-center font-display text-[clamp(48px,13vw,140px)] leading-[1] tracking-[-0.02em] text-white lg:text-[140px]"
      >
        My Process
      </h2>

      {/*
        The cluster. At `lg` it takes the frame's own box and each card is
        absolutely placed; below that it collapses to a centred column.
        `mt` reproduces the 112px between the title's baseline box and the
        first card's bounding box.
      */}
      <ol className="relative mx-auto mt-16 flex w-full max-w-[916.006px] flex-col items-center gap-12 px-6 lg:mt-[112px] lg:block lg:h-[714.771px] lg:px-0">
        {STEPS.map((step) => (
          <li
            key={step.n}
            style={
              {
                "--x": `${step.x}px`,
                "--y": `${step.y}px`,
                "--tilt": step.tilt,
                "--badge": step.color,
                zIndex: step.z,
              } as CSSProperties
            }
            className="relative w-fit max-w-full rotate-[calc(var(--tilt)*5deg)] lg:absolute lg:top-[var(--y)] lg:left-[var(--x)] lg:origin-top-left lg:rotate-[calc(var(--tilt)*12deg)]"
          >
            <div className="flex flex-col gap-[28px] bg-card px-[32px] py-[24px]">
              {/* 16 / 19px, tracking 0 — `leading-[1.1875]` is 19 ÷ 16. */}
              <p className="font-sans text-[14px] leading-[1.1875] text-muted sm:text-[16px]">
                {step.label}
              </p>
              {/* 36 / 44px, tracking 0. */}
              <p className="font-sans text-[26px] leading-[calc(44/36)] text-white sm:text-[32px] lg:text-[36px] lg:whitespace-nowrap">
                {step.title}
              </p>
            </div>

            {/*
              `Process Numbers` — a 28px square hung 10px off the card's top
              right corner. The step order is already carried by the list, so
              the badge is decorative to a screen reader.
            */}
            <span
              aria-hidden
              className="absolute -top-[10px] -right-[10px] flex size-[28px] items-center justify-center bg-[var(--badge)] font-sans text-[14px] leading-[17px] font-semibold text-black"
            >
              {step.n}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
