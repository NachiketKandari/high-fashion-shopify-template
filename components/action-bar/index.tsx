"use client";

import type { ReactNode } from "react";

interface ActionBarProps {
  children?: ReactNode;
}

export function ActionBar({ children }: ActionBarProps) {
  if (!children) return null;

  return (
    <div className="fixed right-5 bottom-5 z-70 flex h-12 items-center border border-rule bg-paper/90 px-1 backdrop-blur-md">
      {children}
    </div>
  );
}
