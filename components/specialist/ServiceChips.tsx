"use client";

import { useEffect, useRef } from "react";

/**
 * The chip cloud that a My Specialist Field row reveals on hover.
 *
 * Motion is ported from the `Our specialties` list on athleticsnyc.com, which
 * is the reference the brief names. Their implementation is GSAP; the numbers
 * below are read from their bundle rather than eyeballed, and reproduced here
 * with CSS transitions so the section keeps its zero-runtime-dependency shape:
 *
 *   reveal    gsap.to(shuffled, { scale: 1, duration: .6, ease: "back.out(1.7)",
 *                                 stagger: { amount: .15 } })
 *   fade      gsap.to(shuffled, { autoAlpha: 1, duration: .3, ease: "power3.out" })
 *   hide      the same two tweens to scale 0 / autoAlpha 0, stagger amount 0
 *   parallax  on mousemove over the row, with dx = (cursorX - rowWidth / 2) / 50,
 *             gsap.to(chip, { x: dx + factor * dx, …, duration: .6,
 *                             ease: "power3.out" }) — a per-chip factor of
 *             2 × random on even indices, 1 × random on odd
 *
 * `back.out(1.7)` is easeOutBack at its default overshoot, which is exactly
 * `cubic-bezier(0.175, 0.885, 0.32, 1.275)`; `power3.out` is easeOutCubic,
 * `cubic-bezier(0.215, 0.61, 0.355, 1)`.
 *
 * Scale and parallax both want the `transform` property, and GSAP composes
 * them where CSS cannot — so each chip is two nested elements: the outer one
 * carries the cursor translation, the inner one the scale and opacity. Their
 * transitions then run independently, exactly as the two tweens do.
 *
 * Athletics scatters its chips over a random CSS grid on every mount. Ours are
 * placed from the Figma frame instead, as fractions of the `Inner Service
 * Chip` box, so the arrangement is the designed one and scales with `--svc`.
 * Only the shuffle order of the stagger and the parallax factors are random,
 * and both are derived from the label so server and client agree.
 */

export type Chip = {
  label: string;
  /** Chip fill from the frame — a CSS colour, under the shared near-black label. */
  color: string;
  /**
   * Top-left corner in the frame's row coordinates, divided by 100 so it rides
   * `--svc` like every other measurement in the section: the frame's x 102,
   * y -43 is `{ x: 1.02, y: -0.43 }`. Chips deliberately overflow the row on
   * every side, which is what makes the cloud read as scattered.
   */
  x: number;
  y: number;
};

/** Total spread of the reveal stagger, matching Athletics' `amount: .15`. */
const STAGGER_MS = 150;
const SCALE_MS = 600;
const FADE_MS = 300;
const EASE_BACK = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const EASE_CUBIC = "cubic-bezier(0.215, 0.61, 0.355, 1)";
/** Athletics divides the cursor offset by 50 before applying it. */
const PARALLAX_DIVISOR = 50;

/**
 * A stable 0–1 hash of the label. Athletics calls `Math.random()` for the
 * shuffle order and the parallax factors; doing that during render would
 * desync hydration, and doing it in an effect would reshuffle on every
 * re-render, so the same scatter is derived from the text instead.
 */
function hash01(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export default function ServiceChips({
  chips,
  active,
}: {
  chips: Chip[];
  active: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Cursor parallax. Written straight to the DOM through a rAF rather than
  // through state, so a mousemove never re-renders the section. The cursor is
  // tracked against the row, which is this box's own parent.
  useEffect(() => {
    const box = boxRef.current;
    const row = box?.parentElement;
    if (!box || !row) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { x, y } = pending;
      const shifters = box.querySelectorAll<HTMLElement>("[data-shift]");
      shifters.forEach((el) => {
        const factor = Number(el.dataset.factor ?? 0);
        el.style.transform = `translate(${x + factor * x}px, ${y + factor * y}px)`;
      });
    };

    const onMove = (event: MouseEvent) => {
      const rect = row.getBoundingClientRect();
      pending = {
        x: (event.clientX - rect.left - rect.width / 2) / PARALLAX_DIVISOR,
        y: (event.clientY - rect.top - rect.height / 2) / PARALLAX_DIVISOR,
      };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    row.addEventListener("mousemove", onMove);
    return () => {
      row.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!chips.length) return null;

  // Athletics shuffles the chips before staggering them, so the reveal does
  // not read left-to-right. `order[i]` is this chip's place in that shuffle.
  const order = chips
    .map((chip, i) => ({ i, key: hash01(chip.label) }))
    .sort((a, b) => a.key - b.key)
    .reduce<number[]>((acc, entry, place) => {
      acc[entry.i] = place;
      return acc;
    }, []);
  const lastPlace = Math.max(chips.length - 1, 1);

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 hidden pointer-fine:block"
    >
      {chips.map((chip, i) => {
        // Even indices drift up to twice as far as odd ones, as Athletics does.
        const factor = (i % 2 === 0 ? 2 : 1) * hash01(`${chip.label}:f`);
        const delay = active ? (order[i] / lastPlace) * STAGGER_MS : 0;
        return (
          <div
            key={chip.label}
            data-shift
            data-factor={factor}
            className="absolute will-change-transform"
            style={{
              left: `calc(var(--svc) * ${chip.x})`,
              top: `calc(var(--svc) * ${chip.y})`,
              transition: `transform ${SCALE_MS}ms ${EASE_CUBIC}`,
            }}
          >
            {/*
              `Container` — a 64px pill, 32px of side padding, label 18 / 120%
              tracking 0 in `Inter Display Medium` on `#1d1d1d`, cap-trimmed.
              Figma fixes the height and centres the trimmed box in it, which
              lands the label 25.5px down; `items-center` reproduces that
              exactly. The width hugs the label, as it does in the frame.
            */}
            <span
              className="text-chip-ink flex h-[calc(var(--svc)*0.64)] min-w-max items-center rounded-full px-[calc(var(--svc)*0.32)] font-sans font-medium will-change-transform [text-box:trim-both_cap_alphabetic]"
              style={{
                backgroundColor: chip.color,
                fontSize: "max(13px, calc(var(--svc) * 0.18))",
                lineHeight: 1.2,
                opacity: active ? 1 : 0,
                visibility: active ? "visible" : "hidden",
                transform: `scale(${active ? 1 : 0})`,
                transition: [
                  `transform ${SCALE_MS}ms ${EASE_BACK} ${delay}ms`,
                  `opacity ${FADE_MS}ms ${EASE_CUBIC} ${delay}ms`,
                  `visibility 0ms linear ${active ? delay : FADE_MS + delay}ms`,
                ].join(", "),
              }}
            >
              {chip.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
