import Image from "next/image";

/**
 * Selected Work — Figma frame `Work` (40003959-1707), 1600 × 938.
 *
 * A white frame that follows the black Process section. Two columns sitting on
 * a 1360px content column (the frame keeps 120px margins, wider than the
 * 1200px column the hero and About use): the display title in a 487px box on
 * the left, and a 760px project block on the right. Both are centred on the
 * frame's own mid-line — the title box (160 tall) and the project block (618
 * tall) share the centre y 469 — so `items-center` reproduces the frame
 * without either being positioned absolutely.
 *
 * Column widths are percentages of the 1360px column (487 ÷ 1360 = 35.8088%,
 * 760 ÷ 1360 = 55.8824%), leaving the frame's 113px gutter to `justify-between`
 * and letting the whole composition scale between `lg` and the 1600px design
 * width. Every other measurement is the literal Figma value.
 *
 * Type is taken verbatim from the frame — see the table in README.md. Letter
 * spacing is written in `em` (-1.6px ÷ 80px = -0.02em, -0.8px ÷ 20px =
 * -0.04em, -0.56px ÷ 14px = -0.04em, -0.1008px ÷ 12px = -0.0084em) so it stays
 * exact at the smaller responsive sizes too.
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
    name: "Nexrank",
    title: "High Converting Marketing Website",
    year: "2026",
    tags: ["UI-design", "Art-direction", "Dev control", "Web-design"],
    image: "/figma/work/nexrank-mockup.jpg",
    imageAlt:
      "The Nexrank marketing site on a laptop resting on a stone plinth, against a deep blue backdrop",
  },
];

export default function WorkSection() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="bg-white py-24 text-ink lg:py-[160px]"
    >
      <div className="mx-auto flex w-full max-w-[1408px] flex-col items-center gap-16 px-6 lg:flex-row lg:justify-between lg:gap-0">
        {/*
          `Title` (40003959:1711) — 80 / 80px (100%), tracking -1.6px, centred
          and set in Figma's `capitalize` text case. The frame gives it a
          487 × 160 box, i.e. exactly two lines.
        */}
        <h2
          id="work-title"
          className="w-full text-center font-display text-[clamp(44px,5.66vw,80px)] leading-[1] tracking-[-0.02em] capitalize lg:w-[35.8088%]"
        >
          {/*
            A non-breaking space keeps the ampersand with `explorations`, which
            is where Figma breaks the two lines. Feature Deck is wide enough
            that the break falls there on its own; Instrument Serif is narrow
            enough to pull the `&` up onto the first line without it.
          */}
          Selected work &amp;&nbsp;explorations
        </h2>

        <ul className="flex w-full flex-col gap-24 lg:w-[55.8824%]">
          {PROJECTS.map((project) => (
            /* `Frame 1948759190` — the 760px project block, 16px above its meta. */
            <li key={project.name} className="flex flex-col gap-[16px]">
              {/*
                `Project Hero Mockup` (40003959:1714) — 760 × 540. In Figma this
                is three layers: a 180°-rotated background fill, a vector at
                `mix-blend-overlay`, and the laptop render on top. They are
                flattened into one 2× export, which is what the frame renders.
              */}
              <div className="relative aspect-[760/540] w-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(min-width: 1408px) 760px, (min-width: 1024px) 56vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>

              {/* `Frame 1948759132` — the caption, 14px between its two rows. */}
              <div className="flex flex-col gap-[14px]">
                {/*
                  Below `sm` the caption stacks — name, title, year — rather
                  than wrapping, which would leave the hairline dangling at the
                  end of a line.
                */}
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  {/*
                    `Frame 1948759130` — name, hairline, title at 8px apart.
                    20 / auto, tracking -0.8px. Figma's Auto line height is the
                    face's own 1.21, which is what makes these 24px boxes; it is
                    pinned so the geometry survives a font fallback.
                  */}
                  <h3 className="flex flex-col items-start gap-1 font-sans text-[20px] leading-[1.21] font-medium tracking-[-0.04em] sm:flex-row sm:items-center sm:gap-[8px]">
                    <span className="lg:whitespace-nowrap">{project.name}</span>
                    {/* `Line 23` — a 16px rule, #0C0C0C at 20%. */}
                    <span
                      aria-hidden
                      className="hidden h-[16px] w-px shrink-0 bg-ink/20 sm:block"
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
                      `Container` — 24px tall, 12px of side padding, 4px radius,
                      filled `Text/Body 3`. The label is 12 / 14.112px
                      (= 1.176), tracking -0.1008px, uppercase, and Figma trims
                      the box to the cap height — `text-box` does the same where
                      it is supported, and centring is within half a pixel of it
                      where it is not.
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
    </section>
  );
}
