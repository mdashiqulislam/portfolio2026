import Image from "next/image";
import Logo from "./Logo";
import ScrambleText from "@/components/effects/ScrambleText";

export default function TopNav() {
  return (
    <header className="relative z-20 h-[103px] shrink-0 bg-gradient-to-b from-black to-transparent">
      <nav className="mx-auto flex h-full w-full max-w-[1248px] items-center justify-between gap-6 px-6">
        <Logo />

        <div className="flex items-center gap-[12px]">
          <a
            href="#contact"
            className="hidden h-[32px] items-center justify-center border border-white px-[16px] font-mono text-[14px] font-medium whitespace-nowrap text-white uppercase transition-colors hover:bg-white hover:text-ink sm:inline-flex"
          >
            <ScrambleText text="Let’s Talk" />
          </a>

          <button
            type="button"
            className="inline-flex h-[32px] items-center justify-center gap-[8px] border border-white px-[16px] font-mono text-[14px] font-medium whitespace-nowrap text-white uppercase transition-colors hover:bg-white/10"
          >
            <ScrambleText text="Menu" />
            <Image
              src="/figma/icon-menu.svg"
              alt=""
              width={15}
              height={7}
              unoptimized
              aria-hidden
              className="h-[7px] w-[15px] max-w-none"
            />
          </button>
        </div>
      </nav>
    </header>
  );
}
