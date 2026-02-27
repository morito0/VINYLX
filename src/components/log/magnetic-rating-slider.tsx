"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useTransform,
} from "framer-motion";

const SNAP_THRESHOLD = 0.15;
const INTEGERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function magneticSnap(raw: number): number {
  const clamped = Math.max(0, Math.min(10, raw));
  const nearest = Math.round(clamped);
  if (Math.abs(clamped - nearest) < SNAP_THRESHOLD) return nearest;
  return Math.round(clamped * 10) / 10;
}

interface MagneticRatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  name?: string;
}

export function MagneticRatingSlider({
  value,
  onChange,
  name = "rating",
}: MagneticRatingSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastSnap = useRef(value);

  const mv = useMotionValue(value);
  const pct = useTransform(mv, [0, 10], ["0%", "100%"]);

  useEffect(() => {
    if (!isDragging) mv.set(value);
  }, [value, isDragging, mv]);

  const resolve = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const { left, width } = el.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - left) / width));
      const snapped = magneticSnap(fraction * 10);

      mv.set(snapped);

      if (snapped !== lastSnap.current) {
        if (snapped === Math.round(snapped)) {
          navigator.vibrate?.(1);
        }
        lastSnap.current = snapped;
        onChange(snapped);
      }
    },
    [mv, onChange]
  );

  const handleDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      resolve(e.clientX);
    },
    [resolve]
  );

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      resolve(e.clientX);
    },
    [isDragging, resolve]
  );

  const handleUp = useCallback(() => setIsDragging(false), []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      let next = value;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = Math.min(10, Math.round((value + 0.1) * 10) / 10);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = Math.max(0, Math.round((value - 0.1) * 10) / 10);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = 10;
          break;
        default:
          return;
      }
      e.preventDefault();
      mv.set(next);
      onChange(next);
    },
    [value, mv, onChange]
  );

  const isSnapped = value === Math.round(value);

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-1">
        <input type="hidden" name={name} value={value.toFixed(1)} />

        {/* Header: label + live value */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Rating</span>
          <m.span
            className="font-mono text-4xl font-bold tracking-tight text-accent-orange"
            animate={{ scale: isDragging ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {value.toFixed(1)}
          </m.span>
        </div>

        {/* Slider interaction area */}
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-label="Album rating"
          className="relative h-12 cursor-grab touch-none select-none focus-visible:outline-none active:cursor-grabbing"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onKeyDown={handleKey}
        >
          {/* Track rail */}
          <div
            ref={trackRef}
            className="absolute inset-x-3.5 top-1/2 h-[6px] -translate-y-1/2 rounded-full"
            style={{ background: "var(--border)" }}
          >
            {/* Filled portion */}
            <m.div
              className="absolute inset-y-0 left-0 rounded-full bg-accent-orange"
              style={{ width: pct }}
            />

            {/* Integer tick marks along the rail */}
            {INTEGERS.map((n) => (
              <div
                key={n}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n * 10}%` }}
              >
                <div
                  className={`h-3 w-px transition-colors duration-150 ${
                    n <= value ? "bg-accent-orange/50" : "bg-muted/15"
                  }`}
                />
              </div>
            ))}

            {/* Thumb */}
            <m.div
              className="absolute rounded-full bg-accent-orange"
              style={{
                left: pct,
                top: "50%",
                x: "-50%",
                y: "-50%",
                width: 28,
                height: 28,
              }}
              animate={{
                scale: isDragging ? 1.2 : 1,
                boxShadow: isDragging
                  ? "0 0 20px 4px rgba(249,115,22,0.5)"
                  : isSnapped
                    ? "0 0 12px 2px rgba(249,115,22,0.35)"
                    : "0 0 8px 1px rgba(249,115,22,0.2)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </div>
        </div>

        {/* Integer labels below */}
        <div className="flex justify-between px-3.5">
          {INTEGERS.map((n) => (
            <span
              key={n}
              className={`min-w-[12px] text-center font-mono text-[10px] transition-colors duration-150 ${
                n === Math.round(value) && isSnapped
                  ? "font-semibold text-accent-orange"
                  : n <= value
                    ? "text-accent-orange/50"
                    : "text-muted/25"
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </LazyMotion>
  );
}
