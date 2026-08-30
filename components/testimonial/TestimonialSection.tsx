"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Customer Testimonial — Figma frames `Lina M.` → `Mizanur Rahman`
 * (40004024-1783 / -1814 / -1834 / -1876 / -1907 / -1926), each 1600 × 1228.
 *
 * Six sibling frames, one per client, that share a single template: the
 * display title at the content column's left edge, then a right-hand block
 * (x 553 → 1400, 847 wide) holding the quote, the client's name, role and
 * logo, a hairline, and the row of six portraits. In each frame a different
 * portrait is the `Active` variant and that client's quote, info and logo are
 * on screen — reproduced here as a click: the portraits are buttons, the title
 * never changes, and everything inside the block re-renders for the selected
 * client.
 *
 * The frames keep the 200px margins the hero, About and Specialist share, so
 * everything is expressed against the same 1200px content column
 * (`max-w-[1248px] px-6`). The 847px block is flush with that column's right
 * edge — 847 ÷ 1200 = 70.5833%, leaving 29.4167% of indent.
 *
 * Vertical rhythm is pinned rather than scaled, the same way About is: the
 * block declares the frames' own first row height (`lg:grid-rows-[365px_auto]`
 * — quote at y 420, client info at y 785), so the info, the rule and the
 * portraits hold their positions while quote stacks of different heights
 * (117 → 250px across the six frames) swap above them. Every stack fits the
 * 365px row from `lg` up, so switching never moves the layout.
 *
 * Type is taken verbatim from the frames — see the table in README.md. Only
 * the title tracks (-2% = -0.02em); every other run is tracked at 0. The
 * frames' `#0C0C0C` text rides the site-wide client-requested flattening to
 * pure black, and the role's `#636363` to the shared `--color-body` #575757. The three
 * body line heights are Figma percentages written as ratios (140% → 1.4,
 * 130% → 1.3, 120% → 1.2) so they survive the responsive sizes.
 */

type QuoteRun = {
  text: string;
  /** Figma sets the emphasised runs in `Inter Display SemiBold`. */
  strong?: boolean;
};

type QuoteParagraph = {
  /** Figma alternates Regular / SemiBold runs within one paragraph. */
  runs: QuoteRun[];
  /**
   * The main paragraphs are 28 / 140%; the secondary ones — Nilio's intro,
   * Irfanul's and Mizanur's closings — are 24 / 130%. Reproduced as spec'd.
   */
  small?: boolean;
};

type Testimonial = {
  name: string;
  role: string;
  /** The frames stack 1–2 paragraphs in a vertical auto-layout, 32px apart. */
  quote: QuoteParagraph[];
  /** Exported artwork, pinned to the bottom-right of the 197 × 50 logo box. */
  logo: { src: string; alt: string; w: number; h: number };
  portrait: string;
};

/** In the frames' row order; the portraits sit at the same x in all six. */
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Lina M.",
    role: "Head of Design at Estater",
    quote: [
      {
        runs: [
          {
            text: "I had the pleasure of working with Ashiqul Islam on a fast-paced and frequently evolving project. He consistently demonstrated the ",
          },
          {
            text: "ability to quickly analyze complex problems and respond with clear, solution-oriented thinking.",
            strong: true,
          },
        ],
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-estater.svg",
      alt: "Estater",
      w: 186,
      h: 27.026,
    },
    portrait: "/figma/testimonial/lina.jpg",
  },
  {
    name: "Nilio Bagga",
    role: "Founder of Samba Soccer Schools",
    quote: [
      {
        runs: [
          {
            text: "I am delighted to write this LinkedIn recommendation for Ashiq, who provided an exceptional UI design for our SaaS software project.",
          },
        ],
        small: true,
      },
      {
        runs: [
          {
            text: "During our collaboration, Ashiq consistently demonstrated a remarkable level of ",
          },
          {
            text: "professionalism, expertise, and dedication.",
            strong: true,
          },
          { text: " What truly set Ashiq apart was " },
          {
            text: "his willingness to go above and beyond.",
            strong: true,
          },
        ],
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-samba.svg",
      alt: "Samba Soccer Schools",
      w: 35,
      h: 46.667,
    },
    portrait: "/figma/testimonial/nilio.jpg",
  },
  {
    name: "Boris Lunoff",
    role: "Chief Technology Officer at Dr. Badi",
    quote: [
      {
        runs: [
          { text: "I have " },
          { text: "enjoyed working", strong: true },
          {
            text: " with Ashiqul who is a very skilled professional able to deliver great results on time and is always ",
          },
          { text: "ready to go the extra mile.", strong: true },
        ],
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-drbadi.svg",
      alt: "Dr. Badi",
      w: 119.47,
      h: 41.399,
    },
    portrait: "/figma/testimonial/boris.jpg",
  },
  {
    name: "Md Irfanul Haque",
    role: "Founder at Rasry",
    quote: [
      {
        runs: [
          {
            text: "I had a great experience working with Ashiq on our leather website project. From day one, ",
          },
          {
            text: "the communication was clear, the process was smooth, and everything was delivered on time.",
            strong: true,
          },
        ],
      },
      {
        runs: [
          {
            text: "Ashiq did a truly professional job and created a website that looks beautiful while offering a great user experience. We're very happy with the final result, and it exceeded our expectations.",
          },
        ],
        small: true,
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-rasry.svg",
      alt: "Rasry",
      w: 137.58,
      h: 30.395,
    },
    portrait: "/figma/testimonial/irfanul.jpg",
  },
  {
    name: "Md Jahid Hasan",
    role: "Project Manager | Web Developer",
    quote: [
      {
        runs: [
          {
            text: "Working with Ashiq was a great experience from start to finish. What impressed us most was how much effort he put into understanding our business before designing anything. He took the ",
          },
          {
            text: "time to review our existing website, conduct user research, speak with our team, and identify the challenges we were facing.",
            strong: true,
          },
          { text: " I would gladly recommend Ashiq to anyone." },
        ],
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-jahid.svg",
      alt: "AppleGadgets",
      w: 124,
      h: 38.914,
    },
    portrait: "/figma/testimonial/jahid.jpg",
  },
  {
    name: "Mizanur Rahman",
    role: "Managing Director & CTO",
    quote: [
      {
        runs: [
          {
            text: "I had a great experience working with Ashiq. I had a great experience working with Ashiq. I had a great experience working with Ashiq. ",
          },
          { text: "I had a great experience working", strong: true },
          {
            text: " with Ashiq. I had a great experience working with Ashiq.",
          },
        ],
      },
      {
        runs: [
          {
            text: " I had a great experience working with Ashiq. I had a great experience working with Ashiq. I had a great experience working with Ashiq.",
          },
        ],
        small: true,
      },
    ],
    logo: {
      src: "/figma/testimonial/logo-mizanur.svg",
      alt: "Opseek",
      w: 126.55,
      h: 32,
    },
    portrait: "/figma/testimonial/mizanur.jpg",
  },
];

export default function TestimonialSection() {
  const [selected, setSelected] = useState(0);
  const current = TESTIMONIALS[selected];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-white py-24 text-black lg:py-[160px]"
    >
      <div className="mx-auto w-full max-w-[1248px] px-6">
        {/*
          `Title` — 80 / 80px (100%), tracking -2% (-1.6px), in a 596px box
          that Figma breaks into two lines. Identical in all six frames; the
          one element a click never touches. The lines are `block` spans rather
          than a `<br>` so the second one can still wrap on a narrow viewport.
        */}
        <h2
          id="testimonials-title"
          className="font-display text-[clamp(40px,6.4103vw,80px)] leading-[1] tracking-[-0.02em]"
        >
          <span className="block">Hear From</span>
          <span className="block">People I&apos;ve Helped</span>
        </h2>

        {/*
          The polite live region: activating a portrait swaps the quote, name,
          role and logo, and a screen reader hears the new content without
          losing focus from the button.
        */}
        <figure
          aria-live="polite"
          className="mt-14 flex flex-col gap-12 lg:mt-[100px] lg:ml-[29.4167%] lg:grid lg:w-[70.5833%] lg:grid-rows-[365px_auto] lg:gap-0"
        >
          {/*
            The quote — a vertical stack of 1–2 paragraphs, 32px apart, exactly
            the frames' auto-layout. Main paragraphs are 28 / 140%; the
            secondary ones (Nilio's intro, Irfanul's and Mizanur's closings)
            are 24 / 130%. Tracking 0 throughout. Both clamps reach the design
            size at 1000px, where the block is the quote's designed measure.
            Figma alternates Regular and SemiBold runs inside a paragraph, so
            each is a single text flow.
          */}
          <blockquote className="flex flex-col gap-[32px]">
            {current.quote.map((para, p) => (
              <p
                key={p}
                className={
                  para.small
                    ? "text-[clamp(18px,2.4vw,24px)] leading-[1.3]"
                    : "text-[clamp(20px,2.8vw,28px)] leading-[1.4]"
                }
              >
                {para.runs.map((run, i) =>
                  run.strong ? (
                    <strong key={i} className="font-semibold">
                      {run.text}
                    </strong>
                  ) : (
                    <span key={i}>{run.text}</span>
                  ),
                )}
              </p>
            ))}
          </blockquote>

          {/* `Client's Info` — three rows, 28px apart. */}
          <figcaption className="flex flex-col gap-[28px]">
            {/*
              `Name & Logo` — a 630px info block and a 197px logo box, 20px
              apart, which is the frames' full 847px. Below `sm` they stack so
              the logo keeps its designed width.
            */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-[20px]">
              {/* `Info` — 4px between the two lines. */}
              <div className="flex flex-col gap-[4px] sm:flex-1">
                {/* 20 / 120%, tracking 0, SemiBold. */}
                <p className="text-[20px] leading-[1.2] font-semibold">
                  {current.name}
                </p>
                {/* 18 / 120%, tracking 0, `Text/Body 1`. */}
                <p className="text-body text-[18px] leading-[1.2]">
                  {current.role}
                </p>
              </div>

              {/*
                `Logo` — a 197 × 50 box; every frame pins its artwork to the
                box's bottom-right corner, at a different natural size. The
                sizes are data, so they ride in `style` rather than classes.
              */}
              <div className="relative h-[50px] w-[197px] shrink-0">
                <Image
                  src={current.logo.src}
                  alt={current.logo.alt}
                  width={Math.round(current.logo.w)}
                  height={Math.round(current.logo.h)}
                  unoptimized
                  className="absolute right-0 bottom-0 max-w-none"
                  style={{ width: current.logo.w, height: current.logo.h }}
                />
              </div>
            </div>

            {/*
              `Line 16` — 847 × 0, `#0C0C0C` at 12%, reproduced as a 1px rule
              rather than the exported SVG.
            */}
            <hr className="bg-ink/12 h-px w-full border-0" />

            {/*
              The six 136.584 × 177.053 portraits spread across the 847px
              block, which leaves the frames' 5.5px between them. Each is a
              percentage of the block (136.584 ÷ 847 = 16.126%) with the gaps
              falling out of `justify-between`, so the row scales as one piece.
              Each portrait is the button that selects its testimonial; the
              selected one is the frame's `Active` variant, the rest are
              `Inactive` at 36%.
            */}
            <ul className="flex items-center justify-between">
              {TESTIMONIALS.map((person, i) => (
                <li
                  key={person.name}
                  className="aspect-[136.584/177.053] w-[16.126%]"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={i === selected}
                    aria-label={`Show ${person.name}'s testimonial`}
                    className={`focus-visible:outline-ink relative block size-full cursor-pointer overflow-hidden transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      i === selected ? "" : "opacity-36 hover:opacity-60 focus-visible:opacity-60"
                    }`}
                  >
                    {/* The button carries the label, so the image is decorative. */}
                    <Image
                      src={person.portrait}
                      alt=""
                      fill
                      sizes="(min-width: 1248px) 137px, 17vw"
                      className="object-cover"
                    />
                    {/*
                      `Loader` — a 1px bar on the portrait's bottom edge, black
                      at 40% over a 10px backdrop blur. The frames draw it
                      identically on both variants, so it reads as a hairline
                      rather than as carousel progress.
                    */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-px bg-black/40 backdrop-blur-[10px]"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
