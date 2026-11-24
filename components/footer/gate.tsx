"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface FooterGateProps {
  children: ReactNode;
}

export function FooterGate({ children }: FooterGateProps) {
  const pathname = usePathname();
  if (pathname === "/search") return null;
  return children;
}
