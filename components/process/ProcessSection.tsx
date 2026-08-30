import ProcessCards from "./ProcessCards";

/**
 * My Process — Figma frame `My Process Section` (40003959-1675), 1600 × 1287.
 *
 * A pure-black frame: the display title at y 160, then six tilted cards
 * scattered across a 916.006 × 714.771 cluster that Figma centres in the frame
 * (x 342 → 1258.006, y 412 → 1126.771).
 *
 * Because the cluster is fixed-size artwork rather than a fluid column, it is
 * reproduced at 1:1 from `lg` up — no scaling — so the measurements are the
 * literal Figma values, the one deliberate departure being the 28px card
 * title (the frame sets 36px). Below `lg` the cards stack into a single
 * column, keeping their tilt at a shallower angle so they still fit the
 * viewport.
 *
 * The cards live in `ProcessCards` (a client component) because they carry
 * the shove-on-hover physics from the client's reference site; the geometry
 * and type are documented there.
 */
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

      <ProcessCards />
    </section>
  );
}
