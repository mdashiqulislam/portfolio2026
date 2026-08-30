import Image from "next/image";
import TopNav from "./TopNav";
import CustomerLogos from "./CustomerLogos";
import ScrambleText from "@/components/effects/ScrambleText";
import LookAtAvatar from "@/components/effects/LookAtAvatar";
import ScrollGrow from "@/components/effects/ScrollGrow";

const STATS = [
  { label: "Years of Experience", value: "5 Years" },
  { label: "Projects Delivered", value: "80+" },
  { label: "Client Satisfaction", value: "100%" },
];

/*
 * Figma frame `Hero Section` (40004023:1265), 1600 × 960. The lockup is
 * centred: H1 at y=180 (77px under the nav), CTA 48px below it, the avatar
 * directly under the CTA (its box runs to y=907, sliding behind the logo
 * rail, which paints on top). The `Flares` sunburst is bottom-anchored and
 * centred at 1094/1600 of the frame width. Stats sit bottom-left and the
 * positioning statement bottom-right, both above the rail (y≈679–756).
 */
export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black">
      {/* Sunburst artwork, pinned to the bottom edge like the frame. */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[max(68.4%,560px)] -translate-x-1/2">
        <Image
          src="/figma/hero/flares.png"
          alt=""
          width={1094}
          height={665}
          priority
          className="h-auto w-full"
        />
      </div>

      <TopNav />

      {/*
        z-30 puts this whole layer above the logo rail (z-20): per the End
        view frame the scaled avatar covers the rail, and the avatar's inner
        z-index can't escape this wrapper's stacking context. Nothing else in
        here overlaps the rail, so only the avatar is affected.
      */}
      <div className="relative z-30 flex flex-1 flex-col items-center px-6">
        <h1 className="mt-[48px] max-w-[715px] text-center font-display text-[clamp(44px,5.625vw,90px)] leading-[1.1] tracking-[-0.02em] text-balance text-white capitalize lg:mt-[77px]">
          Helping Businesses to Scale Faster
        </h1>

        <a
          href="#contact"
          className="mt-[48px] inline-flex h-[32px] items-center justify-center bg-accent px-[16px] font-mono text-[14px] font-medium whitespace-nowrap text-ink uppercase transition-opacity hover:opacity-90"
        >
          <ScrambleText text="Start a Project" />
        </a>

        {/*
          The avatar's box is 302×453, its lower part overlapping the logo
          rail band (95px at frame size) — the negative bottom margin
          recreates that. Per the End view frame it paints ABOVE the rail
          (z-30 over the rail's z-20; at rest the overlap region is
          transparent so nothing changes visually). ScrollGrow scales it
          toward the End view's 2.46× as the page scrolls; LookAtAvatar
          tilts it toward the cursor. The stack is pointer-transparent so
          the grown avatar never blocks anything beneath.
        */}
        <ScrollGrow className="pointer-events-none relative z-30 -mt-[4px] lg:mb-[-95px]">
          <LookAtAvatar>
            <Image
              src="/figma/hero/avatar.png"
              alt=""
              width={302}
              height={453}
              priority
              className="h-auto w-[220px] lg:w-[302px]"
            />
          </LookAtAvatar>
        </ScrollGrow>

        {/*
          Stats + positioning statement, bottom-aligned to each other and
          anchored 56px above the logo rail. This wrapper is the absolute
          containing block and its bottom edge sits exactly where the rail
          begins, so the offset is literally that 56px gap. Below lg they
          fall back into the normal flow under the avatar.
        */}
        <div className="mt-10 flex w-full max-w-[1248px] flex-col gap-10 pb-10 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-[56px] lg:mx-auto lg:mt-0 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:px-6 lg:pb-0">
          <dl className="pointer-events-auto flex flex-wrap items-end gap-x-[12px] gap-y-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex w-[116px] flex-col justify-center gap-[16px]"
              >
                <dt className="font-mono text-[14px] font-medium text-muted uppercase">
                  {stat.label}
                </dt>
                <dd className="font-sans text-[28px] font-semibold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="pointer-events-auto w-full max-w-[262px] font-sans text-[18px] leading-[1.2] text-muted">
            Websites, AI products, brands, and system built for clarity, scales
            and impact.
          </p>
        </div>
      </div>

      <CustomerLogos />
    </section>
  );
}
