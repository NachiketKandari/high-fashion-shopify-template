import type { Metadata } from "next";
import Image from "next/image";

import { CareGuide } from "@/components/content/care-guide";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/care-guide" }),
  description: "How to care for Polite Society corsets, dresses, tops and trousers.",
  openGraph: buildOpenGraph({
    description: "How to care for Polite Society corsets, dresses, tops and trousers.",
    title: "Polite Care Guide",
    type: "website",
    url: "/pages/care-guide",
  }),
  title: "Polite Care Guide",
};

export default function CareGuidePage() {
  return (
    <Page className="pt-0 pb-24">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[2/1]">
        <Image
          alt="Polite Society care guide"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/reference/clone/care-guide.jpg"
        />
      </div>

      <Container className="max-w-3xl">
        <div className="grid gap-10 pt-10">
          <header className="grid gap-3 border-b border-rule pb-6">
            <h1 className="text-lg uppercase leading-[23px] tracking-wider">Polite Care Guide</h1>
            <p className="text-sm italic text-muted-foreground">A little care goes a long way.</p>
          </header>

          <p className="text-sm leading-[22px] font-light tracking-wide text-muted-foreground">
            Our pieces are designed to be worn, lived in and kept for a long time. Follow the care
            instructions below to help preserve their shape, colour, texture and finish. For the
            most accurate instructions, always refer to the care label on your garment.
          </p>

          <CareGuide />

          <p className="border-t border-rule pt-6 text-2xs uppercase tracking-wider text-muted-foreground">
            Questions? Write to hi@politesociety.in or visit the flagship store in Bandra West.
          </p>
        </div>
      </Container>
    </Page>
  );
}
