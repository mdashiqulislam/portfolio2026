import Image from "next/image";
import MaskedLogo from "./MaskedLogo";

const CARD = "relative h-[140px] w-[224px] shrink-0 overflow-hidden bg-card";

/** The 220.7° sweep behind the "Add Your Logo" placeholder card. */
const PLACEHOLDER_GRADIENT =
  "linear-gradient(220.703390169188deg, rgba(248, 252, 235, 0.56) 5.7536%, rgb(134, 127, 239) 32.301%, rgb(66, 241, 235) 57.079%, rgb(208, 222, 0) 94.246%)";

export default function CustomerLogos() {
  return (
    <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-[28px]">
      <p className="px-6 text-center font-mono text-[14px] font-medium text-[#7a7a7a] uppercase">
        Trusted by Ambitious Founders
      </p>

      {/*
        The rail is 1664px wide and deliberately bleeds past a 1600px frame, so
        it stays centre-clipped on desktop. Below `lg` it becomes a scroller so
        the logos remain reachable.
      */}
      <div className="no-scrollbar flex w-full overflow-x-auto lg:justify-center lg:overflow-hidden">
        <div className="flex w-max shrink-0 items-center gap-[16px]">
          {/* Samba Soccer Schools */}
          <div className={CARD}>
            <MaskedLogo
              src="/figma/logo-samba.png"
              label="Samba Soccer Schools"
              className="absolute left-[57px] top-[49px] h-[41.5px] w-[110.065px]"
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
              className="absolute left-[59px] top-[41px] h-[58px] w-[106.645px]"
            />
          </div>

          {/* Placeholder slot */}
          <div
            className="relative h-[140px] w-[224px] shrink-0 overflow-hidden"
            style={{ backgroundImage: PLACEHOLDER_GRADIENT }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-[136px] w-[220px] -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-black">
              <span className="font-display text-[16px] leading-[1.2] tracking-[-0.32px] whitespace-nowrap text-white">
                Add Your Logo
              </span>
            </div>
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

          {/* Telenor Group */}
          <div className={CARD}>
            <MaskedLogo
              src="/figma/logo-telenor-mark.png"
              label="Telenor Group"
              fit="cover"
              position="bottom center"
              className="absolute left-[55px] top-[48.77px] h-[44.231px] w-[52.192px]"
            />
            <MaskedLogo
              src="/figma/logo-telenor-word.png"
              label=""
              className="absolute left-[107.19px] top-[48.77px] h-[44.231px] w-[61.038px]"
              style={{ maskSize: "100% 100%" }}
            />
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
        </div>
      </div>
    </div>
  );
}
