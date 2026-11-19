import type { Metadata } from "next";

import { ContentPage } from "@/components/content/content-page";
import { SizeGuide } from "@/components/content/size-guide";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/size-guide" }),
  description: `Size charts for tops, dresses, bottoms and outerwear at ${shopConfig.site.name}.`,
  openGraph: buildOpenGraph({
    description: `Size charts for tops, dresses, bottoms and outerwear at ${shopConfig.site.name}.`,
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
