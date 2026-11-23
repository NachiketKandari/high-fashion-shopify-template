"use client";

import { useEffect } from "react";

export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
