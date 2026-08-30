import Image from "next/image";
import MaskedLogo from "./MaskedLogo";

const CARD = "relative h-[132px] w-[224px] shrink-0 overflow-hidden bg-card";

/** One full set of the eight cards — the marquee renders it twice. */
function Cards() {
  return (
    <>
      {/* Samba Soccer Schools */}
      <div className={CARD}>
        <MaskedLogo
          src="/figma/logo-samba.png"
          label="Samba Soccer Schools"
          className="absolute left-1/2 top-1/2 h-[41.5px] w-[110.065px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Estater */}
      <div className={CARD}>
        <Image
          src="/figma/logo-estater.svg"
          alt="Estater"
          width={161}
          height={23}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[22.654px] w-[160.863px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* In-Q, by Qatar Museums */}
      <div className={CARD}>
        <MaskedLogo
          src="/figma/logo-inq.png"
          label="In-Q by Qatar Museums"
          className="absolute left-1/2 top-1/2 h-[58px] w-[106.645px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Brain Station 23 */}
      <div className={CARD}>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[13.784px]">
          <MaskedLogo
            src="/figma/bs23-mark-mask.svg"
            label="Brain Station 23"
            className="h-[27.568px] w-[27.916px]"
          />
          <Image
            src="/figma/bs23-word.svg"
            alt=""
            width={146}
            height={14}
            unoptimized
            aria-hidden
            className="h-[13.823px] w-[146.245px] max-w-none"
          />
        </div>
      </div>

      {/* Rasry */}
      <div className={CARD}>
        <Image
          src="/figma/rasry.svg"
          alt="Rasry"
          width={142}
          height={32}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[31.372px] w-[142px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Dr. Badi — Weight Loss & Wellness */}
      <div className={CARD}>
        <Image
          src="/figma/hero/logo-drbadi.svg"
          alt="Dr. Badi Weight Loss and Wellness"
          width={120}
          height={42}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[41.4px] w-[119.5px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Opseek */}
      <div className={CARD}>
        <Image
          src="/figma/hero/logo-opseek.svg"
          alt="Opseek"
          width={127}
          height={32}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[32px] w-[126.5px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Md Ashiqul Islam mark */}
      <div className={CARD}>
        <Image
          src="/figma/hero/logo-self.svg"
          alt="Md Ashiqul Islam"
          width={124}
          height={39}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[38.9px] w-[124px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </>
  );
}

/*
 * Customer logo rail: eight 224×132 cards, 16px gap, running as a continuous
 * right-to-left marquee (client request; the frame showed it static). The
 * track holds two identical sets and slides -50% on a linear loop, so the
 * seam is invisible; the duplicate set is aria-hidden. The animation lives in
 * `.logo-marquee` in globals.css and stops under `prefers-reduced-motion`,
 * leaving a static rail.
 */
export default function CustomerLogos() {
  return (
    <div className="relative z-20 mt-auto w-full overflow-hidden pb-[16px]">
      <div className="logo-marquee flex w-max">
        <div className="flex shrink-0 items-center gap-[16px] pr-[16px]">
          <Cards />
        </div>
        <div className="flex shrink-0 items-center gap-[16px] pr-[16px]" aria-hidden>
          <Cards />
        </div>
      </div>
    </div>
  );
}
