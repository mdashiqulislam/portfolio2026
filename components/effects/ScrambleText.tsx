"use client";

import { useEffect, useRef } from "react";

/** Pool the scrambled frames draw from — matches the vividmotion.co effect. */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

/** Milliseconds between random-character swaps while a char is unresolved. */
const SHUFFLE_EVERY = 40;

/** Total sweep duration; characters lock left-to-right across this window. */
const DURATION = 750;

/**
 * Text-scramble hover effect (vividmotion.co style): on hover, every
 * non-space character cycles through random glyphs, then settles back to the
 * real text in a left-to-right wave.
 *
 * The component renders only the label. It walks up to the nearest
 * <a>/<button> ancestor and listens for `pointerenter` there, so the whole
 * CTA is the hover target while the surrounding markup stays a server
 * component. Layout is stable because the CTAs use a monospace font; each
 * char also gets `inline-block/text-center` as a safety net.
 */
export default function ScrambleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const trigger = root.closest("a, button") ?? root;
    const spans = Array.from(
      root.querySelectorAll<HTMLSpanElement>("[data-ch]"),
    );
    const chars = text.split("");

    function play() {
      cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      let lastShuffle = 0;

      // First scrambled frame paints synchronously so the effect reads as
      // instant, even before the first animation frame is delivered.
      for (let i = 0; i < spans.length; i++) {
        if (chars[i] !== " ") {
          spans[i].textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      function frame(now: number) {
        const t = now - start;
        const shuffle = now - lastShuffle >= SHUFFLE_EVERY;
        if (shuffle) lastShuffle = now;

        let done = true;
        for (let i = 0; i < spans.length; i++) {
          const ch = chars[i];
          if (ch === " ") continue;
          // Each char locks at its own point in the sweep, left to right.
          const lockAt = 120 + (i / Math.max(chars.length - 1, 1)) * (DURATION - 120);
          if (t >= lockAt) {
            spans[i].textContent = ch;
          } else {
            done = false;
            if (shuffle) {
              spans[i].textContent =
                CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
        }

        if (!done) rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    trigger.addEventListener("pointerenter", play);
    return () => {
      trigger.removeEventListener("pointerenter", play);
      cancelAnimationFrame(rafRef.current);
      // Make sure the label is intact if unmount interrupts an animation.
      spans.forEach((s, i) => {
        if (chars[i] !== " ") s.textContent = chars[i];
      });
    };
  }, [text]);

  return (
    <span ref={rootRef} className={className} aria-label={text}>
      {/* Every char (spaces too) gets a data-ch span so indexes align 1:1
          with the text — the animation skips spaces by value, not position. */}
      {text.split("").map((ch, i) => (
        <span key={i} data-ch aria-hidden className="inline-block text-center">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
