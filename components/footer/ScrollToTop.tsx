"use client";

import Image from "next/image";

/**
 * `Scroll to top` (40003959:2065) — a 22 × 123 column: a 22 × 30 white pill
 * holding the 18px `arrow-up-02` icon, then the label rotated 90° CCW (its
 * transform maps the baseline to point up the screen, i.e. it reads bottom to
 * top — `vertical-rl` flipped 180°), 10px apart. Figma ships it as static
 * decoration; here the whole column is the button.
 */
export default function ScrollToTop({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className={`w-[22px] cursor-pointer flex-col items-center gap-[10px] ${className}`}
    >
      <span className="flex h-[30px] w-[22px] items-center justify-center rounded-full bg-white">
        <Image src="/figma/footer/arrow-up.svg" alt="" width={18} height={18} unoptimized />
      </span>
      {/* 16 / auto, tracking 0, cap-height trim. */}
      <span className="rotate-180 text-[16px] [line-height:normal] text-white [writing-mode:vertical-rl] [text-box:trim-both_cap_alphabetic]">
        Scroll to top
      </span>
    </button>
  );
}
