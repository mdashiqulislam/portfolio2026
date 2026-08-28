import ParticleField from "@/components/effects/ParticleField";

export default function ParticlesLabPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-[14px] tracking-widest text-muted uppercase">
          Particle field — preview
        </p>
        <h1 className="max-w-2xl font-display text-[48px] leading-[1.1] text-white">
          Send the shape direction when ready
        </h1>
        <p className="max-w-md text-muted">
          This is an abstract drifting starfield built with Three.js —
          additive-blended points, slow rotation, and mouse parallax. Once you
          decide on a target shape (a hand, your logo, something else), I can
          swap the point placement to trace it instead of the sphere.
        </p>
      </div>
    </main>
  );
}
