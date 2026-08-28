import Image from "next/image";
import PhotoCollage from "./PhotoCollage";

/**
 * About Me — Figma frame `About Me Section` (40003959-1653), 1600 × 1508.
 *
 * A light section: white ground, black display statement. Desktop geometry is
 * taken straight from the frame, expressed against the same 1200px content
 * column the hero uses (`max-w-[1248px] px-6`), so the two sections stay in
 * register. Horizontal offsets are percentages of that column rather than the
 * raw pixels, which keeps the layout intact between `lg` and the 1600px
 * design width.
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-label"
      className="relative isolate bg-white pb-24 text-black lg:pb-[160px]"
    >
      <div className="mx-auto w-full max-w-[1248px] px-6">
        {/*
          Two columns in Figma: 334px of label + portrait on the left, 886px of
          copy on the right. The right column deliberately runs 20px past the
          content column, exactly as the frame does.

          The rows are pinned to the frame's own heights (160→450, 450→734) so
          the portrait, divider, body and collage keep their designed positions
          even though the substituted faces wrap to a different number of lines
          than Figma does. Over-long copy spills into the 145px gap above the
          collage instead of pushing everything below it down.
        */}
        <div className="grid gap-y-12 pt-20 lg:grid-cols-[27.8333%_73.8333%] lg:grid-rows-[290px_284px] lg:gap-y-0 lg:pt-[160px]">
          <h2
            id="about-label"
            className="font-mono text-[14px] font-medium text-muted uppercase lg:col-start-1 lg:row-start-1"
          >
            About me
          </h2>

          {/* The frame indents the first line with 13 leading spaces; a
              text-indent does the same thing without depending on the font's
              space width or on `white-space` handling. */}
          <p className="font-display text-[clamp(32px,4.4vw,56px)] leading-[1.1] indent-[2.25em] lg:col-start-2 lg:row-start-1">
            Design should solve business problems, not just decorate screens. I
            help ambitious teams transform ideas into intuitive digital
            experiences that people enjoy using.
          </p>

          {/* Portrait — 236 × 291, fill cropped as in Figma. The negative
              margin lifts it 28px into row 1, landing it at the frame's y 422. */}
          <div className="relative aspect-[236/291] w-[236px] overflow-hidden bg-card lg:col-start-1 lg:row-start-2 lg:-mt-[28px] lg:w-[70.6587%]">
            <div className="absolute top-[-10%] left-[-14.44%] h-[157.28%] w-[129.08%]">
              <Image
                src="/figma/about/portrait.jpg"
                alt="Md Ashiqul Islam"
                fill
                sizes="305px"
                className="object-cover"
              />
            </div>
          </div>

          <p className="font-sans text-[20px] leading-[1.3] tracking-[-0.04em] text-muted lg:col-start-2 lg:row-start-2 lg:mt-[174px] lg:ml-[33.634%] lg:w-[64.108%] lg:text-[24px]">
            With 5 years of experience designing SaaS, AI products, and web
            applications, I work as a strategic design partner helping founders
            validate ideas, reduce design friction, and deliver products with
            speed and confidence.
          </p>
        </div>

        {/*
          `Frame 1948759103` (x 120, y 530, 1318 × 14): a 1278px rule running
          from x 160 to x 1438 — 40px past the content column on either side —
          with a small cross mark at x 1188. At `lg` it takes the frame's own
          absolute position; below that it simply follows the copy.

          The rule is spec'd white at 12% opacity, which is invisible against
          this section's white ground — it reads as a leftover from the dark
          hero. Left as designed; `border-black/12` would reveal it.

          `-z-10` reproduces the frame's paint order: Figma draws the rule
          before `My Photo`, so it passes behind the portrait rather than
          across it.
        */}
        <div
          aria-hidden
          className="pointer-events-none relative -z-10 mt-12 h-[14px] lg:absolute lg:inset-x-0 lg:top-[530px] lg:mt-0"
        >
          <div className="mx-auto w-full max-w-[1326px] lg:px-6">
            <div className="relative h-full">
              <div className="absolute inset-x-0 top-[7px] border-t border-white/12" />
              <Image
                src="/figma/about/divider-cross.svg"
                alt=""
                width={8}
                height={8}
                unoptimized
                className="absolute top-[3px] left-[80.4383%] h-[8px] w-[8px] max-w-none -translate-x-1/2"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-[144.66px]">
          <PhotoCollage />
        </div>
      </div>
    </section>
  );
}
