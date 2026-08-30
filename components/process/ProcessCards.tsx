"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import shoveOnHover from "@/components/effects/shoveOnHover";

/**
 * The six tilted step cards, with the shove-on-hover physics from the client's
 * reference site — see `components/effects/shoveOnHover.ts`, which the About
 * collage shares so the two cannot drift apart.
 *
 * The hit area here is the `li` (the tilted card itself, where the reference
 * uses an invisible grid cell), and the mover is an inner wrapper carrying the
 * card and its badge, so the hover target never moves out from under the
 * cursor. The inertia rotation lands on the mover and so composes with the
 * li's own ±12° tilt.
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
  /**
   * Desktop card width. Figma hugs the card to its title, but the title is set
   * below the design's 36px, so the width is pinned here instead — these are
   * the widths the cards hugged to at 36px, which keeps the composition and
   * the overlaps exactly as designed. (Figma's own hug widths are ~7% narrower
   * again — see the `Inter Display` note in README.md.)
   */
  w: number;
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
    w: 308.094,
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
    w: 311.641,
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
    w: 444.18,
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
    w: 294.945,
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
    w: 435.672,
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
    w: 380.5,
    z: 5,
  },
];

export default function ProcessCards() {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    return list ? shoveOnHover(list) : undefined;
  }, []);

  return (
    /*
      The cluster. At `lg` it takes the frame's own box and each card is
      absolutely placed; below that it collapses to a centred column.
      `mt` reproduces the 112px between the title's baseline box and the
      first card's bounding box.
    */
    <ol
      ref={listRef}
      className="relative mx-auto mt-16 flex w-full max-w-[916.006px] flex-col items-center gap-12 px-6 lg:mt-[112px] lg:block lg:h-[714.771px] lg:px-0"
    >
      {STEPS.map((step) => (
        <li
          key={step.n}
          style={
            {
              "--x": `${step.x}px`,
              "--y": `${step.y}px`,
              "--w": `${step.w}px`,
              "--tilt": step.tilt,
              "--badge": step.color,
              zIndex: step.z,
            } as CSSProperties
          }
          className="relative w-fit max-w-full rotate-[calc(var(--tilt)*5deg)] lg:absolute lg:top-[var(--y)] lg:left-[var(--x)] lg:origin-top-left lg:rotate-[calc(var(--tilt)*12deg)]"
        >
          {/* The hover physics move this wrapper, never the `li` — the card
              glides while its hit area stays put under the cursor. */}
          <div className="relative">
            <div className="flex flex-col justify-center gap-[28px] bg-card px-[32px] py-[24px] lg:h-[139px] lg:w-[var(--w)]">
              {/* 16 / 19px, tracking 0 — `leading-[1.1875]` is 19 ÷ 16. */}
              <p className="font-sans text-[14px] leading-[1.1875] text-muted sm:text-[16px]">
                {step.label}
              </p>
              {/*
                28px, down from the frame's 36px at the client's request. The
                line height keeps the frame's 44 ÷ 36 ratio (34.22px here), and
                the card box above is pinned so it does not shrink with it.
              */}
              <p className="font-sans text-[24px] leading-[calc(44/36)] text-white sm:text-[28px] lg:whitespace-nowrap">
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
          </div>
        </li>
      ))}
    </ol>
  );
}
