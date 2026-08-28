import type { CSSProperties } from "react";

type MaskedLogoProps = {
  /** Path to the artwork used as the alpha mask. */
  src: string;
  label: string;
  className?: string;
  /** Fill shown through the mask. Matches the grey plate used in the design. */
  color?: string;
  /** `cover` mirrors a Figma image fill that crops rather than stretches. */
  fit?: "stretch" | "cover";
  position?: string;
  style?: CSSProperties;
};

/**
 * Renders a logo as a solid fill clipped by its own artwork. The design paints
 * each customer logo white and lays a `mix-blend-darken` grey plate over it;
 * masking a grey box produces the same flat result in a single element.
 */
export default function MaskedLogo({
  src,
  label,
  className = "",
  color = "var(--color-logo)",
  fit = "stretch",
  position = "center",
  style,
}: MaskedLogoProps) {
  const maskSize = fit === "cover" ? "cover" : "100% 100%";

  return (
    <span
      role="img"
      aria-label={label}
      className={`logo-mask ${className}`}
      style={{
        backgroundColor: color,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize,
        WebkitMaskSize: maskSize,
        maskPosition: position,
        WebkitMaskPosition: position,
        ...style,
      }}
    />
  );
}
