import Image from "next/image";

/**
 * Customer Testimonial — Figma frame `Customer Testimonial` (40003959-1942),
 * 1600 × 1229.
 *
 * A white frame that follows the black My Specialist Field section: the
 * display title at the content column's left edge, then a single right-hand
 * block (x 553 → 1400, 847 wide) holding the quote, the client's name and
 * logo, a hairline, and the row of six client portraits.
 *
 * The frame keeps the 200px margins the hero, About and Specialist share, so
 * it is expressed against the same 1200px content column
 * (`max-w-[1248px] px-6`). The 847px block is flush with that column's right
 * edge — 847 ÷ 1200 = 70.5833%, leaving 29.4167% of indent — so the whole
 * composition scales as one piece and lands on the frame's exact geometry once
 * the column caps at 1248px.
 *
 * Vertical rhythm is pinned rather than scaled, the same way About is: the
 * block declares the frame's own first row height (`lg:grid-rows-[365px_auto]`
 * — quote at y 420, client info at y 785), so the info, the rule and the
 * portraits stay where the frame puts them even though the substituted faces
 * wrap the quote to a different number of lines than Figma does. A longer
 * quote spills into the 173px of slack under it instead of pushing everything
 * below it down.
 *
 * Type is taken verbatim from the frame — see the table in README.md. Letter
 * spacing is written in `em` (-1.6px ÷ 80px = -0.02em) so it stays exact at
 * the smaller responsive sizes; every other run in the frame is tracked at 0.
 * All three body runs are set to Figma's 120% line height, written as the
 * ratio `1.2` so it survives the responsive sizes too.
 */

type Person = {
  name: string;
  /**
   * Figma carries the role on the portrait component's own name rather than
   * rendering it, so it is used here for the alt text. Only the featured
   * client's role is shown on screen.
   */
  role: string;
  portrait: string;
};

/** `Frame 40003959:1966` — the six portraits, in the frame's order. */
const PEOPLE: Person[] = [
  {
    name: "Lina M.",
    role: "Head of Design at Estater",
    portrait: "/figma/testimonial/lina.jpg",
  },
  {
    name: "Nilio Bagga",
    role: "Founder of Samba Soccer Schools",
    portrait: "/figma/testimonial/nilio.jpg",
  },
  {
    name: "Boris Lunoff",
    role: "Chief Technology Officer",
    portrait: "/figma/testimonial/boris.jpg",
  },
  {
    name: "Md Irfanul Haque",
    role: "Cholotrip Tech Founder",
    portrait: "/figma/testimonial/irfanul.jpg",
  },
  {
    name: "Md Jahid Hasan",
    role: "Project Manager & Web Developer",
    portrait: "/figma/testimonial/jahid.jpg",
  },
  {
    name: "Md Mizanur Rahman",
    role: "Project Manager & Web Developer",
    portrait: "/figma/testimonial/mizanur.jpg",
  },
];

/**
 * The one testimonial the frame spells out. Its portrait is the only one in
 * the row set to the `Active` variant; the other five are `Inactive` at 36%,
 * which is what marks this quote as the one on screen.
 */
const FEATURED = {
  author: PEOPLE[0],
  /* `40003959:1945` — one paragraph, the second half set in Bold. */
  lead: "I had the pleasure of working with Ashiqul Islam on a fast-paced and frequently evolving project. He consistently demonstrated the ",
  emphasis:
    "ability to quickly analyze complex problems and respond with clear, solution-oriented thinking.",
  logo: {
    /* `logo2 1` — 186 × 27.026, bottom-right of a 197 × 50 box. */
    src: "/figma/testimonial/logo-estater.svg",
    alt: "Estater",
  },
};

export default function TestimonialSection() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-white py-24 text-ink lg:py-[160px]"
    >
      <div className="mx-auto w-full max-w-[1248px] px-6">
        {/*
          `40003959:1943` — 80 / 80px (100%), tracking -1.6px, in a 596px box
          that Figma breaks into two lines. The lines are `block` spans rather
          than a `<br>` so the second one can still wrap on a narrow viewport,
          where the clamp has taken the face well below its design size.
        */}
        <h2
          id="testimonials-title"
          className="font-display text-[clamp(40px,6.4103vw,80px)] leading-[1] tracking-[-0.02em]"
        >
          <span className="block">Hear From</span>
          <span className="block">People I&apos;ve Helped</span>
        </h2>

        <figure className="mt-14 flex flex-col gap-12 lg:mt-[100px] lg:ml-[29.4167%] lg:grid lg:w-[70.5833%] lg:grid-rows-[365px_auto] lg:gap-0">
          {/*
            `40003959:1945` — 32 / 38.4px (120%), tracking 0, `Text/Black`.
            Figma sets the emphasis as a second run in Bold within the same
            paragraph, so it is one text flow rather than two blocks.
          */}
          <blockquote className="text-[clamp(22px,3.2vw,32px)] leading-[1.2]">
            <p>
              {FEATURED.lead}
              <strong className="font-bold">{FEATURED.emphasis}</strong>
            </p>
          </blockquote>

          {/* `Client's Info` (40003959:1946) — three rows, 28px apart. */}
          <figcaption className="flex flex-col gap-[28px]">
            {/*
              `Name & Logo` (40003959:1947) — a 630px info block and a 197px
              logo box, 20px apart, which is the frame's full 847px. Below `sm`
              they stack so the logo keeps its designed width.
            */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-[20px]">
              {/* `Info` (40003959:1948) — 4px between the two lines. */}
              <div className="flex flex-col gap-[4px] sm:flex-1">
                {/* 20 / 24px (120%), tracking 0, SemiBold. */}
                <p className="text-[20px] leading-[1.2] font-semibold">
                  {FEATURED.author.name}
                </p>
                {/* 18 / 21.6px (120%), tracking 0, `Text/Body 1`. */}
                <p className="text-body text-[18px] leading-[1.2]">
                  {FEATURED.author.role}
                </p>
              </div>

              {/*
                `Logo` (40003959:1951) — a 197 × 50 box with the 186 × 27.026
                wordmark pinned to its bottom-right corner, which is where the
                frame sits it.
              */}
              <div className="relative h-[50px] w-[197px] shrink-0">
                <Image
                  src={FEATURED.logo.src}
                  alt={FEATURED.logo.alt}
                  width={186}
                  height={27}
                  unoptimized
                  className="absolute right-0 bottom-0 h-[27.026px] w-[186px] max-w-none"
                />
              </div>
            </div>

            {/*
              `Line 16` (40003959:1965) — 847 × 0, `#0C0C0C` at 12%, reproduced
              as a 1px rule rather than the exported SVG.
            */}
            <hr className="bg-ink/12 h-px w-full border-0" />

            {/*
              `40003959:1966` — the six 136.584 × 177.053 portraits spread
              across the 847px block, which leaves the frame's 5.5px between
              them. Each is a percentage of the block (136.584 ÷ 847 =
              16.126%) with the gaps falling out of `justify-between`, so the
              row scales as one piece.
            */}
            <ul className="flex items-center justify-between">
              {PEOPLE.map((person) => (
                <li
                  key={person.name}
                  className={`relative aspect-[136.584/177.053] w-[16.126%] overflow-hidden ${
                    person === FEATURED.author ? "" : "opacity-36"
                  }`}
                >
                  <Image
                    src={person.portrait}
                    alt={`${person.name}, ${person.role}`}
                    fill
                    sizes="(min-width: 1248px) 137px, 17vw"
                    className="object-cover"
                  />
                  {/*
                    `Loader` — a 1px bar on the portrait's bottom edge, black
                    at 40% over a 10px backdrop blur. The frame carries it on
                    both variants at full width, so it reads as a hairline
                    rather than as carousel progress.
                  */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-black/40 backdrop-blur-[10px]"
                  />
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
