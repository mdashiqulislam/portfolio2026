import Image from "next/image";
import Avatar3D from "@/components/effects/Avatar3D";
import LookAtAvatar from "@/components/effects/LookAtAvatar";

/*
 * Side-by-side acceptance surface for the 3D avatar. With no params both
 * columns run live (CSS tilt vs WebGL); `?yaw=14&pitch=10&freeze=1` pins a
 * deterministic pose on both sides for headless screenshots — wait for
 * [data-avatar3d-ready="1"] before capturing. yaw/pitch use the CSS-degree
 * convention on BOTH columns; the three-space conversion lives in the scene.
 * The hero's flares sit behind as the fringe/halo acceptance background.
 */

function num(value: string | string[] | undefined): number | undefined {
  const s = Array.isArray(value) ? value[0] : value;
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function AvatarLabPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const yaw = num(sp.yaw);
  const pitch = num(sp.pitch);
  const freeze = sp.freeze === "1";
  const fixed = yaw !== undefined || pitch !== undefined;

  // The WebGL side always applies LookAtAvatar's positional drift with the
  // pose, so the fixed CSS column replicates it too — otherwise the
  // silhouettes would misregister by up to 8px at full yaw.
  const shiftX = ((yaw ?? 0) / 14) * 8;
  const shiftY = (-(pitch ?? 0) / 10) * (8 * 0.6);
  const cssTransform = `perspective(800px) translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${pitch ?? 0}deg) rotateY(${yaw ?? 0}deg)`;

  const flat = (
    <Image
      src="/figma/hero/avatar.png"
      alt=""
      width={302}
      height={453}
      unoptimized
      className="h-auto w-[302px]"
    />
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-[max(68.4%,560px)] -translate-x-1/2">
        <Image
          src="/figma/hero/flares.png"
          alt=""
          width={1094}
          height={665}
          priority
          className="h-auto w-full"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-wrap items-center justify-center gap-16 px-6 py-16">
        <figure className="flex flex-col items-center gap-6">
          <figcaption className="font-mono text-[14px] tracking-widest text-muted uppercase">
            CSS (old)
          </figcaption>
          {fixed ? (
            <div style={{ transform: cssTransform }}>{flat}</div>
          ) : (
            <LookAtAvatar>{flat}</LookAtAvatar>
          )}
        </figure>

        <figure className="flex flex-col items-center gap-6">
          <figcaption className="font-mono text-[14px] tracking-widest text-muted uppercase">
            WebGL (new)
          </figcaption>
          <Avatar3D debug={{ yawDeg: yaw, pitchDeg: pitch, freeze }}>{flat}</Avatar3D>
        </figure>
      </div>
    </main>
  );
}
