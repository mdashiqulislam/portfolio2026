import Image from "next/image";
import TopNav from "./TopNav";
import CustomerLogos from "./CustomerLogos";
import ParticleHand from "@/components/effects/ParticleHand";
import ScrambleText from "@/components/effects/ScrambleText";

const STATS = [
  { label: "Years of Experience", value: "5 Years" },
  { label: "Projects Delivered", value: "80+" },
  { label: "Client Satisfaction", value: "100%" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/*
        The artwork is placed exactly as in Figma: 131.75% × 114.38% of the
        frame, offset -12.61% / -6.72%. The wrapper carries that geometry so the
        image itself can stay `object-cover` — it keeps the crop on other
        viewport aspect ratios instead of distorting.
      */}
      <div className="pointer-events-none absolute -z-10 left-[-12.61%] top-[-6.72%] h-[114.38%] w-[131.75%]">
        {/* <Image
          src="/figma/hero-bg.png"
          alt=""
          fill
          priority
          sizes="132vw"
          className="object-cover object-center "
        /> */}
        {/*
          Rebuilds the hand artwork as an interactive particle cloud, sampled
          from the same image so it lands pixel-perfect on the static hand.
          Falls back to the plain image if WebGL or sampling is unavailable.
        */}
        <ParticleHand src="/figma/hero-bg.png" />
      </div>

      {/*
        On narrow viewports the artwork sits behind the copy. A scrim keeps the
        stats and positioning statement legible; desktop matches Figma exactly.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent lg:hidden" />

      <TopNav />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-16 pt-[57px] pb-[53px]">
        {/* Main lockup */}
        <div className="mx-auto w-full max-w-[1248px] px-6">
          <div className="flex w-full max-w-[715px] flex-col items-start gap-[36px]">
            <h1 className="font-display text-[clamp(40px,6.2vw,80px)] leading-[1.1] tracking-[-0.02em] text-balance text-white capitalize">
              Helping Businesses to Scale Faster
            </h1>

            <a
              href="#contact"
              className="inline-flex h-[32px] items-center justify-center bg-accent px-[16px] font-mono text-[14px] font-medium whitespace-nowrap text-ink uppercase transition-opacity hover:opacity-90"
            >
              <ScrambleText text="Start a Project" />
            </a>
          </div>
        </div>

        {/* Stats + positioning statement */}
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-10 px-6 lg:flex-row lg:items-end lg:justify-between">
          <dl className="flex flex-wrap items-end gap-x-[12px] gap-y-8">
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

          <p className="w-full max-w-[262px] font-sans text-[18px] leading-[1.2] text-muted">
            Websites, AI products, brands, and system built for clarity, scales
            and impact.
          </p>
        </div>
      </div>

      <CustomerLogos />
    </section>
  );
}
