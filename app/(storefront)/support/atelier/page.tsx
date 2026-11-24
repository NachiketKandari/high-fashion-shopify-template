import type { Metadata } from "next";
import Image from "next/image";

import { SupportAside } from "@/components/support/support-aside";
import { SupportPage } from "@/components/support/support-page";
import { SupportActionLink, SupportSteps } from "@/components/support/support-sections";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const DESCRIPTION = `Craftsmanship, material and finishing at ${shopConfig.site.name}.`;

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/support/atelier" }),
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    description: DESCRIPTION,
    title: "Inside the atelier",
    type: "website",
    url: "/support/atelier",
  }),
  title: "Inside the atelier",
};

const STEPS = [
  {
    body: "Every piece begins with a consideration of shape, movement and the way it will be worn.",
    title: "Thoughtfully conceived",
  },
  {
    body: "Fabric, fit and finish work together. The details are considered as part of the whole, not as an afterthought.",
    title: "Material & construction",
  },
  {
    body: "Before a piece leaves the atelier, the final checks bring the design and its construction into focus.",
    title: "The final inspection",
  },
];

export default function AtelierPage() {
  return (
    <SupportPage
      aside={
        <SupportAside title="The details matter">
          <div className="relative aspect-[342/250] overflow-hidden border border-rule desktop:aspect-[512/340]">
            <Image
              alt="Tailoring tools and pattern pieces on a workbench"
              className="object-cover"
              fill
              sizes="100vw"
              src="/reference/clone/about-craftsmanship.png"
            />
          </div>
          <p className="type-body-sm text-ink-muted">
            Explore craftsmanship, care and fit through the concierge.
          </p>
          <Button className="w-full" render={<Link href="/support" />} size="lg" variant="outline">
            Contact the Atelier
          </Button>
          <p className="type-body-sm text-ink">
            <SupportActionLink href="/pages/care-guide">Care & alterations</SupportActionLink>
          </p>
        </SupportAside>
      }
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/support", label: "Support" },
        { label: "Inside the atelier" },
      ]}
      intro="From first sketch to the final detail."
      title="Inside the atelier"
    >
      <div className="relative aspect-[342/250] overflow-hidden border border-rule desktop:aspect-[768/380]">
        <Image
          alt="Tailors working at sewing machines in the atelier"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/reference/clone/about-atelier.png"
        />
      </div>
      <SupportSteps items={STEPS} />
      <div className="grid gap-6">
        <Button className="w-full" render={<Link href="/collections/all" />} size="lg">
          Explore the Collection
        </Button>
        <p className="type-body-sm text-ink-muted">
          <SupportActionLink href="/support">Ask the concierge about a piece</SupportActionLink>
        </p>
      </div>
    </SupportPage>
  );
}
