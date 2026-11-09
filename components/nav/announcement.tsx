"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Need it sooner? Reach out to us before placing your order",
  "Free shipping worldwide above ₹50,000",
];

const ROTATE_MS = 3000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function Announcement() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused = hovered || focused || documentHidden || reducedMotion;

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReducedMotion(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    const onVisibilityChange = () => setDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      query.removeEventListener("change", onChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      aria-atomic="true"
      aria-label="Announcement"
      aria-live="polite"
      className="relative flex h-(--announcement-h) items-center justify-center overflow-hidden bg-ink text-inverse"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="region"
    >
      {MESSAGES.map((message, messageIndex) => (
        <p
          className="absolute inset-0 flex items-center justify-center px-5 text-center text-xs leading-4 tracking-[0.05em] transition-[opacity,transform] duration-(--motion-long) ease-(--ease-standard) data-[active=false]:pointer-events-none data-[active=false]:translate-y-1 data-[active=false]:opacity-0"
          aria-hidden={messageIndex !== index}
          data-active={messageIndex === index}
          key={message}
        >
          {message}
        </p>
      ))}
    </div>
  );
}
