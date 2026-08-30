import Image from "next/image";
import type { CSSProperties } from "react";
import CollageReveal from "./CollageReveal";

/**
 * The collage occupies the full 1200px content column in Figma, from y 878.66
 * to y 1348.34 — every photo below is placed as a percentage of that box, so
 * the whole arrangement scales with the column instead of breaking apart.
 */
const STAGE_W = 1200;
const STAGE_H = 469.6875;

/** Narrowest the stage is allowed to get before the rail starts scrolling. */
const STAGE_MIN_W = 720;

type Photo = {
  src: string;
  alt: string;
  /** Placement in the stage, in percent. */
  left: number;
  top: number;
  width: number;
  height: number;
  /**
   * Figma "crop" fill — the image is laid out larger than its frame and
   * clipped, rather than being centre-cropped by `object-cover`.
   */
  crop?: { left: number; top: number; width: number; height: number };
  /** Figma stretches this fill to the frame instead of cropping it. */
  stretch?: boolean;
};

const LEFT: Photo[] = [
  {
    src: "/figma/about/gallery-l3.jpg",
    alt: "An alpine valley and farmhouses reflected in a car's wing mirror",
    left: 11.25,
    top: 0,
    width: 25.3125,
    height: 43.9086,
  },
  {
    src: "/figma/about/gallery-l2.jpg",
    alt: "A tent, camp chairs and a barbecue set up beside a waterfall",
    left: 0,
    top: 47.9047,
    width: 21.4063,
    height: 36.1276,
  },
  {
    src: "/figma/about/gallery-l1.jpg",
    alt: "Standing on a dirt ridge above rolling green hills",
    left: 22.9688,
    top: 47.9047,
    width: 13.5938,
    height: 44.1082,
    crop: { left: -50.85, top: -11.56, width: 189.27, height: 111.76 },
  },
];

const MIDDLE: Photo[] = [
  {
    src: "/figma/about/gallery-middle.jpg",
    alt: "A hiking route traced over a photograph of the Brenta Dolomites",
    left: 38.125,
    top: 15.7683,
    width: 23.8281,
    height: 84.2317,
  },
];

const RIGHT: Photo[] = [
  {
    src: "/figma/about/gallery-r1.jpg",
    alt: "Bamboo rafts on a green river running through a narrow canyon",
    left: 63.5157,
    top: 7.7844,
    width: 13.5938,
    height: 44.1082,
    stretch: true,
  },
  {
    src: "/figma/about/gallery-r2.jpg",
    alt: "Arms outstretched on a hilltop looking over a wide green valley",
    left: 78.6719,
    top: 23.7526,
    width: 21.3281,
    height: 68.2619,
  },
  {
    src: "/figma/about/gallery-r3.jpg",
    alt: "Photographing a double rainbow from the window of a moving car",
    left: 63.5157,
    top: 55.8854,
    width: 13.5938,
    height: 44.1082,
  },
];

/**
 * `sizes` for a photo that is `width`% of a stage which is 1200px on desktop,
 * roughly the viewport in between, and pinned at 720px on small screens.
 */
function photoSizes({ width, crop }: Photo) {
  // A cropped fill is laid out wider than its frame, so it needs more pixels.
  const pct = (width / 100) * ((crop?.width ?? 100) / 100);
  return [
    `(min-width: 1248px) ${Math.round(pct * STAGE_W)}px`,
    `(min-width: 768px) ${(pct * 100).toFixed(1)}vw`,
    `${Math.round(pct * STAGE_MIN_W)}px`,
  ].join(", ");
}

function pct(value: number) {
  return `${value}%`;
}

/**
 * The centre image is the anchor of the reveal: it never moves, and the six
 * around it start stacked on top of it and slide out to their own places.
 */
const ANCHOR = MIDDLE[0];

/** Centre point of a photo, in percent of the stage. */
function centre({ left, top, width, height }: Photo) {
  return { x: left + width / 2, y: top + height / 2 };
}

/**
 * Where a photo has to start for its centre to sit on the anchor's, given as a
 * translation in percent of the photo's *own* box — which is what `translate()`
 * resolves percentages against. Expressing it that way means the offset needs
 * no pixel values and stays exact at every stage size.
 */
function offsetOntoAnchor(photo: Photo) {
  const anchor = centre(ANCHOR);
  const self = centre(photo);
  return {
    tx: `${(((anchor.x - self.x) / photo.width) * 100).toFixed(3)}%`,
    ty: `${(((anchor.y - self.y) / photo.height) * 100).toFixed(3)}%`,
  };
}

/** How far apart the photos start moving, nearest to the anchor first. */
const STAGGER_MS = 55;

/**
 * Ordering the spread by distance makes it read as one outward push from the
 * centre rather than six separate entrances.
 */
const SPREAD_ORDER = [...LEFT, ...RIGHT]
  .map((photo) => {
    const anchor = centre(ANCHOR);
    const self = centre(photo);
    // Put both axes on one scale before comparing — `top`/`height` are percent
    // of the stage's height, which is much shorter than its width.
    const dx = anchor.x - self.x;
    const dy = ((anchor.y - self.y) * STAGE_H) / STAGE_W;
    return { src: photo.src, distance: Math.hypot(dx, dy) };
  })
  .sort((a, b) => a.distance - b.distance)
  .map((entry) => entry.src);

function Frame({ photo, anchor }: { photo: Photo; anchor: boolean }) {
  const { src, alt, left, top, width, height, crop, stretch } = photo;

  // The anchor sits still, so it carries none of the reveal's custom properties.
  const reveal = anchor ? null : offsetOntoAnchor(photo);

  const style = {
    left: pct(left),
    top: pct(top),
    width: pct(width),
    height: pct(height),
    ...(reveal && {
      "--tx": reveal.tx,
      "--ty": reveal.ty,
      "--reveal-delay": `${SPREAD_ORDER.indexOf(src) * STAGGER_MS}ms`,
    }),
  } as CSSProperties;

  return (
    <li className="absolute" data-anchor={anchor || undefined} style={style}>
      {/*
        The hover physics move this wrapper, never the `li` — the photo glides
        while its hit area stays put under the cursor, and the shove composes
        with the reveal's transform instead of fighting it on one element.
        `overflow-hidden` rides along so the fill stays clipped to the frame,
        and `bg-card` is the placeholder Figma paints behind it, which shows
        through only while the photo is still loading.
      */}
      <div className="relative size-full overflow-hidden bg-card">
        <div
          className="absolute"
          style={
            crop
              ? {
                  left: pct(crop.left),
                  top: pct(crop.top),
                  width: pct(crop.width),
                  height: pct(crop.height),
                }
              : { inset: 0 }
          }
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={photoSizes(photo)}
            className={stretch ? "object-fill" : "object-cover"}
          />
        </div>
      </div>
    </li>
  );
}

export default function PhotoCollage() {
  return (
    /*
      Below `STAGE_MIN_W` the photos would shrink to thumbnails, so the stage
      stops scaling and the rail scrolls sideways instead — the same escape
      hatch the hero's logo rail uses.

      That scroller only exists below `md`, which is exactly where it is needed:
      the content column is `100vw - 48px`, so it falls under the stage's 720px
      floor at viewports narrower than 768px. Above that the overflow goes back
      to `visible`, because a scroll container clips — and `overflow-x: auto`
      drags `overflow-y` from `visible` to `auto` with it, so the box was
      cropping hovered photos on all four sides, not just horizontally.
    */
    <div className="no-scrollbar -mx-6 overflow-x-auto px-6 md:overflow-x-visible">
      {/*
        With JavaScript off the stage never leaves `pending`, so undo it. The
        reduced-motion case is handled in CSS instead, which also covers a slow
        or failed hydration.
      */}
      <noscript>
        <style>{`.collage[data-reveal="pending"] > li{transform:none!important;opacity:1!important}`}</style>
      </noscript>

      <CollageReveal
        className="collage relative w-full list-none"
        style={{
          aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          minWidth: `${STAGE_MIN_W}px`,
        }}
      >
        {[...LEFT, ...MIDDLE, ...RIGHT].map((photo) => (
          <Frame key={photo.src} photo={photo} anchor={photo === ANCHOR} />
        ))}
      </CollageReveal>
    </div>
  );
}
