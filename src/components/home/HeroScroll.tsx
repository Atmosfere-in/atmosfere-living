"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Homepage hero: a scroll-scrubbed film (534 frames) — the approach to a house, through its living room, to the view.
 * Ported from the "Scrollymation" section; timings and layout are unchanged.
 *
 * Loading is progressive so it starts at once: the first frame shows immediately, a coarse pass (every 8th frame)
 * follows so any scroll position has a nearby frame, then the gaps fill in. Phones use lighter 960px frames and
 * every second frame.
 */
const FRAME_COUNT = 534;
const SCROLL_LENGTH_VH = 700; // total scroll distance for the whole sequence
const INTRO_FADE_END = 0.035; // intro copy is gone by this progress
const MID_BEAT_CENTER = 300 / (FRAME_COUNT - 1); // frame 300 = the moment the camera steps inside
const MID_BEAT_WIDTH = 0.045;
const ARRIVAL_START = 0.94; // final beat
const PARALLEL_LOADS = 6;

const framePath = (n: number, small: boolean) => (small ? `/hero/sm/${String(n).padStart(4, "0")}.webp` : `/hero/lg/${String(n).padStart(4, "0")}.jpg`);

function ramp(x: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
// A symmetric bump that rises then falls back to 0 — for the brief mid-scroll label.
function bump(x: number, center: number, width: number) {
  const t = Math.abs(x - center) / width;
  return t >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
}

export function HeroScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadedPct, setLoadedPct] = useState(0);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const step = small ? 2 : 1;

    // The frames this device uses (1-based file numbers).
    const frames: number[] = [];
    for (let n = 1; n <= FRAME_COUNT; n += step) frames.push(n);
    if (frames[frames.length - 1] !== FRAME_COUNT) frames.push(FRAME_COUNT);
    const images: (HTMLImageElement | null)[] = new Array(frames.length).fill(null);
    let wanted = 0; // frame index the scroll position asks for
    let drawn = -1;
    let dest = { dx: 0, dy: 0, dw: 0, dh: 0 };
    let disposed = false;
    let ticking = false;
    let loaded = 0;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < frames.length; d++) {
        if (images[i - d]) return i - d;
        if (images[i + d]) return i + d;
      }
      return -1;
    };

    function computeRect() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const first = images.find(Boolean);
      const ir = first ? first.naturalWidth / first.naturalHeight : 16 / 9;
      if (w / h > ir) dest = { dw: w, dh: w / ir, dx: 0, dy: (h - w / ir) / 2 };
      else dest = { dh: h, dw: h * ir, dy: 0, dx: (w - h * ir) / 2 };
    }

    function draw(i: number) {
      const at = nearestLoaded(i);
      if (at < 0 || at === drawn) return;
      drawn = at;
      ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);
      ctx.drawImage(images[at]!, dest.dx, dest.dy, dest.dw, dest.dh);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      computeRect();
      drawn = -1;
      draw(wanted);
    }

    function syncText(progress: number) {
      if (introRef.current) {
        const fade = 1 - Math.min(1, progress / INTRO_FADE_END);
        introRef.current.style.opacity = String(fade);
        introRef.current.style.transform = `translateY(${(1 - fade) * -20}px)`;
        introRef.current.style.pointerEvents = progress > INTRO_FADE_END ? "none" : "auto";
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - Math.min(1, progress / 0.015));
      if (midRef.current) midRef.current.style.opacity = String(bump(progress, MID_BEAT_CENTER, MID_BEAT_WIDTH));
      if (arrivalRef.current) {
        const a = ramp(progress, ARRIVAL_START, 1);
        arrivalRef.current.style.opacity = String(a);
        arrivalRef.current.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
    }

    function update() {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const total = rect.height - stage.clientHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      wanted = Math.min(frames.length - 1, Math.round(progress * (frames.length - 1)));
      draw(wanted);
      syncText(progress);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    // ---- Progressive loading: first frame, then every 8th, then the rest, a few at a time ----
    const order: number[] = [0];
    for (let i = 8; i < frames.length; i += 8) order.push(i);
    order.push(frames.length - 1);
    for (let i = 1; i < frames.length; i++) if (!order.includes(i)) order.push(i);
    if (reduceMotion) order.splice(1); // just one still frame
    let next = 0;

    const loadOne = (): Promise<void> | void => {
      if (disposed || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(frames[i], small);
      return img
        .decode()
        .catch(() => new Promise<void>((res) => {
          img.onload = () => res();
          img.onerror = () => res();
        }))
        .then(() => {
          if (disposed) return;
          if (img.naturalWidth) images[i] = img;
          loaded++;
          if (i === 0) {
            resize();
            update();
            setReady(true);
          } else if (Math.abs(i - wanted) < Math.abs(drawn - wanted)) {
            draw(wanted); // a closer frame just arrived
          }
          if (loaded % 12 === 0 || loaded === order.length) setLoadedPct(Math.round((loaded / order.length) * 100));
          return loadOne();
        });
    };
    for (let k = 0; k < PARALLEL_LOADS; k++) loadOne();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={sectionRef} className="hero-scroll relative w-full bg-[#0a0a08]" style={{ height: `${SCROLL_LENGTH_VH}vh` }}>
      <section
        ref={stageRef}
        aria-label="A walk through a home styled by Atmosfere"
        className="sticky top-[var(--header-height)] h-[calc(100svh-var(--header-height))] w-full overflow-hidden bg-[#0a0a08]"
      >
        {/* Preloader — only until the first frame is in */}
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-[#0a0a08] transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? "none" : "auto" }}
        >
          <span className="font-display text-[15px] tracking-[0.06em] text-white/85">Preparing the approach</span>
          <div className="h-[2px] w-52 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#e7d9b8]" />
          </div>
        </div>

        {/* Scroll-scrubbed frame sequence */}
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }} />

        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

        {/* Intro copy */}
        <div
          ref={introRef}
          className="relative z-10 flex h-full flex-col justify-center px-[var(--gutter)]"
          style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
        >
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(20,20,16,0.55)] px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase text-white/75">
              Atmosfere Living
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.3rem,5.4vw,3.75rem)] leading-[1.07] text-white">
              Step into a home,
              <br />
              styled corner by corner
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-[1.72] text-white/70 md:text-[16.5px]">
              Arrive, walk through the living room and out to the view — then bring the pieces home.
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[11px] tracking-[0.22em] uppercase text-white/55">Scroll to begin</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce text-white/50" aria-hidden>
            <path d="M3.5 6l4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Mid beat — as the camera steps inside */}
        <div ref={midRef} className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex justify-center" style={{ opacity: 0 }}>
          <span className="rounded-full border border-white/15 bg-[rgba(10,10,8,0.5)] px-4 py-2 text-[13px] font-medium tracking-[0.28em] uppercase text-white">
            Step inside
          </span>
        </div>

        {/* Arrival beat — the final reveal */}
        <div
          ref={arrivalRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-20 text-center"
          style={{ opacity: 0 }}
        >
          <span className="text-[11px] font-medium tracking-[0.4em] uppercase text-white/70">You have arrived</span>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5.4vw,3.6rem)] leading-[1.05] text-white">Your space awaits</h2>
          <Link href="/shop" className="btn mt-8 bg-[#e7d9b8] text-[#0a0a08] hover:brightness-105">
            Shop the collection <ArrowRight size={14} />
          </Link>
        </div>

        {/* Quiet loading indicator while the rest of the film streams in */}
        {ready && loadedPct < 100 && (
          <span className="pointer-events-none absolute bottom-4 right-4 z-10 text-[10px] tabular-nums tracking-[0.2em] text-white/35">{loadedPct}%</span>
        )}
      </section>
    </div>
  );
}
