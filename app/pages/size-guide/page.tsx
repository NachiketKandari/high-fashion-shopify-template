import type { Metadata } from "next";

import { ContentPage } from "@/components/content/content-page";
import { SizeGuide } from "@/components/content/size-guide";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/size-guide" }),
  description: "Polite Society size charts for tops, dresses, bottoms and outerwear.",
  openGraph: buildOpenGraph({
    description: "Polite Society size charts for tops, dresses, bottoms and outerwear.",
    title: "Size Guide",
    type: "website",
    url: "/pages/size-guide",
  }),
  title: "Size Guide",
};

export default function SizeGuidePage() {
  return (
    <ContentPage eyebrow="Fit & Measurements" title="Size Guide">
      <SizeGuide />
    </ContentPage>
  );
}
