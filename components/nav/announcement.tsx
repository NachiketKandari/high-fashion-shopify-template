"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Need it sooner? Reach out to us before placing your order",
  "Free shipping worldwide above $500",
];

const ROTATE_MS = 3000;

export function Announcement() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      aria-live="polite"
      className="relative flex h-[35px] items-center justify-center overflow-hidden bg-black text-white md:h-[30px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcement"
    >
      {MESSAGES.map((message, messageIndex) => (
        <p
          className="absolute inset-0 flex items-center justify-center px-5 text-center text-xs leading-4 tracking-wider transition-[opacity,transform] duration-500 data-[active=false]:pointer-events-none data-[active=false]:translate-y-0.5 data-[active=false]:opacity-0"
          data-active={messageIndex === index}
          key={message}
        >
          {message}
        </p>
      ))}
    </div>
  );
}
