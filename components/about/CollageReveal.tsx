"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import shoveOnHover from "@/components/effects/shoveOnHover";

/**
 * Runs the collage's two-stage motion: the photos spread out from behind the
 * centre image the first time the stage scrolls into view, and once they have
 * all landed the shove-on-hover physics take over.
 *
 * The stage ships as `data-reveal="pending"` — every photo stacked on the
 * centre image at zero opacity — and this flips it to `in`, which is what the
 * CSS transition in `globals.css` runs against, then to `done` when the last
 * photo arrives. Those are one-way attribute writes rather than React state:
 * the component never needs to re-render, and React leaves a prop it did not
 * itself change alone, so a re-render higher up cannot rewind the reveal.
 *
 * Everything that would otherwise leave the reveal unplayed resolves to the
 * finished composition instead — reduced motion and a slow hydration through
 * the CSS, no `IntersectionObserver` through the early flip here, and no
 * JavaScript at all through the `<noscript>` block in PhotoCollage.
 */
export default function CollageReveal({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Under reduced motion `pending` already renders as the final composition,
    // and `shoveOnHover` declines too, so there is nothing to set up.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposeShove: (() => void) | null = null;

    /*
     * Hand over to the hover physics only once every photo has come to rest.
     * Shoving one that is still flying in would race the CSS transition, and
     * counting `transitionend` keeps that boundary tied to the animation
     * itself rather than to a duration copied out of the stylesheet.
     */
    const landed = new Set<Element>();
    const arriving = stage.querySelectorAll("li:not([data-anchor])").length;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      const photo = event.target as HTMLElement;
      if (photo.parentElement !== stage || photo.hasAttribute("data-anchor"))
        return;

      landed.add(photo);
      if (landed.size < arriving) return;

      stage.removeEventListener("transitionend", onTransitionEnd);
      stage.dataset.reveal = "done";
      disposeShove = shoveOnHover(stage);
    };

    const play = () => {
      stage.addEventListener("transitionend", onTransitionEnd);
      stage.dataset.reveal = "in";
    };

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver === "undefined") {
      play();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          play();
        },
        // Wait for a quarter of the stage, so the spread reads as a reveal
        // rather than something already half over by the time it is on screen.
        { threshold: 0.25 },
      );
      observer.observe(stage);
    }

    return () => {
      observer?.disconnect();
      stage.removeEventListener("transitionend", onTransitionEnd);
      disposeShove?.();
    };
  }, []);

  return (
    <ul
      ref={stageRef}
      data-reveal="pending"
      className={className}
      style={style}
    >
      {children}
    </ul>
  );
}
