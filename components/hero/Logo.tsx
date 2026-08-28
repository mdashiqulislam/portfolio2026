import Image from "next/image";
import Link from "next/link";

/** Wordmark lockup from the top nav — 128 × 39 at design scale. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Md Ashiqul Islam — home"
      className={`relative block h-[39px] w-[128px] shrink-0 ${className}`}
    >
      <Image
        src="/figma/logo-mark.svg"
        alt=""
        width={81}
        height={39}
        unoptimized
        aria-hidden
        className="absolute left-0 top-0 h-[38.742px] w-[80.777px] max-w-none"
      />
      <Image
        src="/figma/logo-title.svg"
        alt=""
        width={99}
        height={19}
        unoptimized
        aria-hidden
        className="absolute left-[28.7px] top-0 h-[19.254px] w-[99.378px] max-w-none"
      />
    </Link>
  );
}
