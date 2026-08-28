import Image from "next/image";
import CalBooking from "./CalBooking";
import ScrollToTop from "./ScrollToTop";

/**
 * Footer — Figma frame `Footer` (40003959-1985), 1600 × 1644, the page's
 * closing black section after the Short Portfolio ring.
 *
 * Four zones, pinned to the frame's own vertical rhythm at `lg`: the contact
 * header (title + four stat blocks) at y 0, the Cal.com booking block at
 * y 202 (64px below the 138px header), the footer content (title, terms row,
 * three nav columns) at y 1054 (250px below the booking block), and the
 * clipped "Design Partner" wordmark strip at y 1434 (160px below), 210 tall.
 *
 * The header and footer content sit in the 1200px content column the hero,
 * About and Specialist share (`max-w-[1248px] px-6`); the booking block keeps
 * the frame's wider 160px margins — a 1280px column (`max-w-[1328px] px-6`).
 *
 * The aurora background is the frame's own image fill (CROP), baked to a
 * single 1600 × 1644 export and pinned to the section's *bottom* at the
 * frame's aspect, so however tall the live Cal embed makes the section, the
 * glow stays in register with the wordmark strip that blends against it; any
 * extra height above fades into the same black the image opens with.
 *
 * The wordmark strip scales as one piece (`aspect-[1600/210]`, children in
 * percentages). `Design` is the frame's image-masked group (plus its 40%
 * echo copy) baked to a 2× PNG of exactly the visible 753.89 × 139 crop;
 * `Partner` is the frame's white vector (exported pre-clipped to its visible
 * 811.7 × 138) and the Caveat note, both restated live with the OVERLAY
 * blend Figma gives them, so the aurora reads through exactly as designed.
 */

/** `Facts Content` (40003959:2050) — four 116px blocks, 24px apart. */
const FACTS = [
  { label: "Users Impacted", value: "200K+" },
  { label: "Client Satisfaction", value: "100%" },
  { label: "Projects Delivered", value: "80+" },
  { label: "Years of Experience", value: "5 Years" },
];

/**
 * `Footer Navigation Links` (40003959:2006). Figma gives none of these a
 * destination, so only the addresses derivable from the frame's own copy are
 * real (mailto:, tel:, and WhatsApp via the listed number); the rest ship as
 * `#` placeholders to be filled in. The expertise column mirrors the My
 * Specialist Field services, so it links to that section.
 */
const EXPERTISE = [
  "UX Audit",
  "UIUX Design",
  "Website Design",
  "Mobile App Design",
  "Web App Design",
  "Marketing Design",
];

const QUICK_CONTACT = [
  { label: "WhatsApp", href: "https://wa.me/8801998591208" },
  { label: "Telegram", href: "#" },
];

const SOCIAL = [
  { label: "Dribbble", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Linkedin", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "X", href: "#" },
];

/* `Title` fills (1999/2049) — a top-to-bottom #fff → #d2d2d2 linear. */
const TITLE_GRADIENT =
  "bg-[linear-gradient(180deg,#ffffff_0%,#d2d2d2_100%)] bg-clip-text text-transparent";

/*
 * `Numbers` fill (2053) — Figma's four-stop linear over the 116 × 34 text
 * box, restated in the element's own pixel space: 202deg with the stops at
 * 5.8 / 32.3 / 57.1 / 94.2% (the transform's t = 0…1 span mapped onto the
 * CSS gradient line).
 */
const NUMBER_GRADIENT =
  "bg-[linear-gradient(202deg,rgba(248,252,235,0.56)_5.8%,#867fef_32.3%,#42f1eb_57.1%,#d0de00_94.2%)] bg-clip-text text-transparent";

/* 14 / auto Spline Sans Mono Medium, uppercase, cap-height trim. */
const MONO_LABEL =
  "font-mono text-[14px] font-medium uppercase [line-height:normal] [text-box:trim-both_cap_alphabetic]";

function NavColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {/* Column titles are white at 36%; 32px down to the list. */}
      <h3 className={`${MONO_LABEL} mb-8 text-white/36`}>{title}</h3>
      {children}
    </div>
  );
}

/* `Menus` — 20px between 18px Inter Display rows, cap-height trimmed. */
const MENU = "flex flex-col gap-5";
const MENU_ITEM =
  "text-[18px] [line-height:normal] [text-box:trim-both_cap_alphabetic]";

export default function FooterSection() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-black text-white"
    >
      {/* The frame's aurora image fill, pinned to the bottom at its aspect. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 aspect-[1600/1644]"
      >
        <Image
          src="/figma/footer/footer-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative">
        {/* `Section Content` (2048) — title left, facts bottom-aligned right. */}
        <div className="mx-auto w-full max-w-[1248px] px-6 lg:flex lg:items-end lg:justify-between">
          {/* 64 / 108%, tracking -2%, white → #d2d2d2. */}
          <h2
            id="contact-title"
            className={`font-display text-[clamp(40px,5.1282vw,64px)] leading-[1.08] tracking-[-0.02em] ${TITLE_GRADIENT}`}
          >
            <span className="block">Not Getting Results?</span>
            <span className="block">Let&apos;s Change That.</span>
          </h2>

          <dl className="mt-10 grid grid-cols-2 gap-6 lg:mt-0 lg:flex">
            {FACTS.map((fact) => (
              /* 116px block, 16px between label and number. */
              <div key={fact.label} className="flex w-[116px] flex-col gap-4">
                {/* The title gradient again, at the fill's 72%. */}
                <dt className={`${MONO_LABEL} ${TITLE_GRADIENT} opacity-72`}>
                  {fact.label}
                </dt>
                {/* 28 / auto Inter Display SemiBold. */}
                <dd
                  className={`text-[28px] font-semibold [line-height:normal] ${NUMBER_GRADIENT}`}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* `Book a Call` (2063) — the 1280px column, radius 8, 64px down. */}
        <div className="mx-auto mt-12 w-full max-w-[1328px] px-6 lg:mt-16">
          <div className="overflow-hidden rounded-[8px] lg:min-h-[602px]">
            <CalBooking />
          </div>
        </div>

        {/* `Footer Content` (1997) — 250px below the booking block. */}
        <div className="relative mx-auto mt-24 w-full max-w-[1248px] px-6 lg:mt-[250px] lg:flex lg:items-start lg:justify-between">
          {/* `Title Text Content` (1998). */}
          <div>
            {/* 56 / 108%, tracking -2%, the same gradient as the header. */}
            <p
              className={`font-display text-[clamp(36px,4.4872vw,56px)] leading-[1.08] tracking-[-0.02em] ${TITLE_GRADIENT}`}
            >
              <span className="block">Need Better UX?</span>
              <span className="block">Let&apos;s Build It Together.</span>
            </p>

            {/* `Other Links` (2000) — 12px gaps, diamonds between. */}
            <ul className="mt-12 flex flex-wrap items-center gap-[12px] lg:mt-[90px]">
              <li className={`${MONO_LABEL} text-white/48`}>
                <a href="#">Terms</a>
              </li>
              <li aria-hidden>
                <Image
                  src="/figma/footer/diamond.svg"
                  alt=""
                  width={8}
                  height={8}
                  unoptimized
                />
              </li>
              <li className={`${MONO_LABEL} text-white/48`}>
                <a href="#">Policy</a>
              </li>
              <li aria-hidden>
                <Image
                  src="/figma/footer/diamond.svg"
                  alt=""
                  width={8}
                  height={8}
                  unoptimized
                />
              </li>
              <li className={`${MONO_LABEL} text-white/48`}>
                Handcrafted by ashiqul
              </li>
            </ul>
          </div>

          {/*
            `Footer Navigation Links` — a 576px block flush with the column's
            right edge (576 ÷ 1200 = 48%): two fluid columns and the fixed
            80px Social one, 40px apart.
          */}
          <nav
            aria-label="Footer"
            className="mt-16 grid grid-cols-2 gap-10 lg:mt-0 lg:w-[48%] lg:grid-cols-[1fr_1fr_80px]"
          >
            <NavColumn title="My Expertise">
              <ul className={MENU}>
                {EXPERTISE.map((item) => (
                  <li key={item} className={MENU_ITEM}>
                    <a href="#specialist">{item}</a>
                  </li>
                ))}
              </ul>
            </NavColumn>

            {/* `Frame 1948759161` — two stacked groups, 42px apart. */}
            <div className="flex flex-col gap-[42px]">
              <NavColumn title="Quick Contact">
                <ul className={MENU}>
                  {QUICK_CONTACT.map((item) => (
                    <li key={item.label} className={MENU_ITEM}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </NavColumn>
              <NavColumn title="For Enquiry">
                <ul className={MENU}>
                  {/* The `E. ` / `P. ` prefixes are white at 36% in Figma. */}
                  <li className={MENU_ITEM}>
                    <span aria-hidden className="text-white/36">
                      E.{" "}
                    </span>
                    <a href="mailto:hello@ashiq.com">hello@ashiq.com</a>
                  </li>
                  <li className={MENU_ITEM}>
                    <span aria-hidden className="text-white/36">
                      P.{" "}
                    </span>
                    <a href="tel:+8801998591208">+880 1998591208</a>
                  </li>
                </ul>
              </NavColumn>
            </div>

            <NavColumn title="Social">
              <ul className={MENU}>
                {SOCIAL.map((item) => (
                  <li key={item.label} className={MENU_ITEM}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </NavColumn>
          </nav>

          {/*
            `Scroll to top` sits 48px right of the content column (design
            x 1448 → 1272 from the container's left edge), level with the
            footer content. It needs 46px beyond the capped column, so it
            shows once the viewport clears 1360px.
          */}
          <ScrollToTop className="absolute top-0 left-[1272px] hidden min-[1360px]:flex" />
        </div>

        {/*
          `Footer Visual Element` (1986) — the 1600 × 210 strip, 160px below
          the footer content, that crops the giant "Design Partner" wordmark
          at the page's bottom edge. Everything in it is a percentage of the
          1600px frame, so the artwork scales as one piece at any width.
        */}
        <div aria-hidden className="relative mt-20 aspect-[1600/210] w-full overflow-hidden lg:mt-40">
          {/*
            `Design` (1987) — the image-masked word plus its offset 40% echo,
            baked to a 2× PNG of the visible 753.89 × 139 crop, bottom-flush.
          */}
          <Image
            src="/figma/footer/design-wordmark.png"
            alt=""
            width={1508}
            height={278}
            className="absolute bottom-0 left-0 h-auto w-[47.118%] max-w-none"
          />
          {/*
            `Partner` (1995) — the white vector, pre-clipped to its visible
            811.7 × 138 and blended OVERLAY so the aurora lights it.
          */}
          <Image
            src="/figma/footer/partner.svg"
            alt=""
            width={812}
            height={138}
            unoptimized
            className="absolute bottom-0 left-[49.125%] h-auto w-[50.731%] max-w-none mix-blend-overlay"
          />
          {/*
            `Hire Your Next!` (1996) — Caveat 34 / 24px at the frame's 1600,
            written in vw so it scales with the strip, OVERLAY like the
            wordmark. Centred over a 178px box starting at x 786.
          */}
          <span className="absolute top-0 left-[49.125%] w-[11.125%] text-center font-script text-[2.125vw] leading-[calc(24/34)] text-white mix-blend-overlay">
            Hire Your Next!
          </span>
        </div>
      </div>
    </footer>
  );
}
