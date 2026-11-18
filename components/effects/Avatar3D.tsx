"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AvatarSceneHandle } from "./avatar3d/createAvatarScene";

/**
 * Progressive-enhancement shell around the real-3D hero avatar. The children
 * (the existing LookAtAvatar + <Image> stack) server-render as usual and stay
 * mounted forever as the fallback; once the WebGL scene has painted its first
 * frame the fallback flips to opacity-0 in the same frame — no crossfade, the
 * rest pose is pixel-identical by construction, and a fade would only
 * double-composite the alpha wisps over the flares.
 *
 * three never appears in this module: the scene is `import()`ed from an
 * effect (the Next "loading external libraries" pattern), so the ~150KB chunk
 * loads lazily, on idle, and only after the gates pass — reduced motion off,
 * WebGL2 available. Any failure anywhere leaves today's exact behavior.
 */
/**
 * Parses the pose LookAtAvatar is currently showing out of its inline
 * transform (the only rotateX/rotateY writer inside the box). Null before the
 * first pointermove, on coarse pointers, under reduced motion, or if the
 * transform's shape ever changes — the scene then starts at rest, exactly
 * matching the untransformed fallback.
 */
function readFallbackPose(root: HTMLElement): { cssX: number; cssY: number } | null {
  const el = root.querySelector<HTMLElement>('[style*="rotateY("]');
  const m = el
    ? /rotateX\((-?[\d.eE+-]+)deg\)\s*rotateY\((-?[\d.eE+-]+)deg\)/.exec(el.style.transform)
    : null;
  if (!m) return null;
  const cssX = Number(m[1]);
  const cssY = Number(m[2]);
  return Number.isFinite(cssX) && Number.isFinite(cssY) ? { cssX, cssY } : null;
}

export default function Avatar3D({
  children,
  className = "",
  debug,
}: {
  children: ReactNode;
  className?: string;
  /** Lab-page hook: fixed pose (CSS-degree convention) and/or single-frame freeze. */
  debug?: { yawDeg?: number; pitchDeg?: number; freeze?: boolean };
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const yawDeg = debug?.yawDeg;
  const pitchDeg = debug?.pitchDeg;
  const freeze = debug?.freeze;
  const hasDebug = debug !== undefined;

  useEffect(() => {
    const maybeBox = boxRef.current;
    const maybeHost = hostRef.current;
    if (!maybeBox || !maybeHost) return;
    // Re-bind as non-null consts so the async closure below keeps the narrowing.
    const box: HTMLDivElement = maybeBox;
    const host: HTMLDivElement = maybeHost;

    // Debug skips the reduced-motion gate so lab screenshots stay deterministic.
    if (!hasDebug && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // No WebGL2 ⇒ bail before the three chunk ever downloads (r185 needs it).
    if (!document.createElement("canvas").getContext("webgl2")) return;

    const mode: "pointer" | "sway" = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches
      ? "pointer"
      : "sway";

    let cancelled = false;
    let handle: AvatarSceneHandle | null = null;
    let idle = 0;
    let timer = 0;

    async function init() {
      try {
        const { createAvatarScene } = await import("./avatar3d/createAvatarScene");
        if (cancelled) return;
        const created = await createAvatarScene({
          host,
          box,
          textureUrl: "/figma/hero/avatar.png",
          mode,
          // Lets the scene take over mid-interaction at the fallback's live
          // pose instead of snapping to rest at the handoff.
          getFallbackPose: () => readFallbackPose(box),
          debug: hasDebug ? { yawDeg, pitchDeg, freeze } : undefined,
          onFirstFrame: () => {
            if (!cancelled) setReady(true);
          },
          onContextLost: () => {
            // Flat image + CSS tilt come back instantly; scene is torn down.
            setReady(false);
            handle?.dispose();
            handle = null;
          },
        });
        if (cancelled) {
          created.dispose();
          return;
        }
        handle = created;
      } catch {
        // Renderer construction, texture 404, … — stay on the fallback.
      }
    }

    if (freeze) {
      void init(); // determinism for screenshots — no idle wait
    } else if (typeof window.requestIdleCallback === "function") {
      // Keep the three chunk from competing with the LCP image.
      idle = window.requestIdleCallback(() => void init(), { timeout: 1500 });
    } else {
      timer = window.setTimeout(() => void init(), 200); // Safari has no rIC
    }

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
      handle?.dispose();
      handle = null;
    };
  }, [hasDebug, yawDeg, pitchDeg, freeze]);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div ref={hostRef} aria-hidden className="pointer-events-none absolute -inset-[15%] z-0" />
      <div
        className={ready ? "relative z-10 opacity-0" : "relative z-10"}
        data-avatar3d-ready={ready ? "1" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
