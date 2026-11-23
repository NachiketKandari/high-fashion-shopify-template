import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: {
    default: "Returns & Exchanges",
    template: "%s | Returns & Exchanges",
  },
};

export default function ReturnsLayout({ children }: { children: ReactNode }) {
  return children;
}
