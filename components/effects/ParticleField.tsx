"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ParticleFieldProps = {
  className?: string;
  count?: number;
  color?: string;
};

/** Soft radial-gradient dot, drawn once to a canvas and reused as every point sprite. */
function makeSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Abstract drifting starfield — a placeholder shape. Swap the position
 * generation below for a `MeshSurfaceSampler` pass once there's a target mesh
 * (a hand, a logo, whatever) to trace the particles over.
 */
export default function ParticleField({
  className = "",
  count = 2400,
  color = "#ffffff",
}: ParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radius = 11;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.35 + 0.65 * Math.cbrt(Math.random()));
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const sprite = makeSprite();
    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(color),
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let raf = 0;
    let pointerX = 0;
    let pointerY = 0;
    const clock = new THREE.Clock();

    function renderFrame() {
      renderer.render(scene, camera);
    }

    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      renderFrame();
    }

    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }

    function loop() {
      const t = clock.getElapsedTime();
      points.rotation.y = t * 0.03;
      points.rotation.x = Math.sin(t * 0.05) * 0.08;
      camera.position.x += (pointerX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (-pointerY * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      renderFrame();
      raf = requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    if (reducedMotion) {
      renderFrame();
    } else {
      container.addEventListener("pointermove", onPointerMove);
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      sprite.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [count, color]);

  return <div ref={containerRef} className={`h-full w-full ${className}`} aria-hidden />;
}
