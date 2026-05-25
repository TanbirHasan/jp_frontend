"use client";

import { useEffect, useRef, useState } from "react";

export function PageLoader() {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  useEffect(() => {
    clearTimers();
    setOpacity(1);
    setVisible(true);
    setWidth(0);

    schedule(() => setWidth(35), 50);
    schedule(() => setWidth(65), 300);
    schedule(() => setWidth(85), 700);
    schedule(() => setWidth(95), 1200);
    schedule(() => {
      setWidth(100);
      schedule(() => {
        setOpacity(0);
        schedule(() => {
          setVisible(false);
          setWidth(0);
          setOpacity(1);
        }, 250);
      }, 150);
    }, 1800);

    return clearTimers;
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-emerald-500 transition-all duration-300 ease-out pointer-events-none"
      style={{
        width: `${width}%`,
        opacity,
        boxShadow: "0 0 10px rgba(16, 185, 129, 0.6), 0 0 4px rgba(16, 185, 129, 0.4)",
      }}
    />
  );
}
