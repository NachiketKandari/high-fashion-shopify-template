import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const SECTIONS = [
  { href: "#about", label: "About Polite" },
  { href: "#founder", label: "Founder" },
  { href: "#philosophy", label: "Brand Philosophy" },
  { href: "#store", label: "Flagship Store" },
  { href: "#atelier", label: "Atelier" },
  { href: "#archive", label: "Archive" },
];

const VALUES = [
  { image: "/reference/clone/about-ethical.png", label: "Ethical Production" },
  { image: "/reference/clone/about-individuality.png", label: "Individuality" },
  { image: "/reference/clone/about-craftsmanship.png", label: "Craftsmanship" },
  { image: "/reference/clone/about-sensuality.png", label: "Sensuality" },
  { image: "/reference/clone/about-design-integrity.png", label: "Design Integrity" },
  { image: "/reference/clone/about-community.png", label: "Community" },
];

const ARCHIVE = [
  { image: "/reference/clone/archive-ii.jpg", label: "CH II" },
  { image: "/reference/clone/archive-iii.jpg", label: "CH III" },
  { image: "/reference/clone/archive-iv.jpg", label: "CH IV" },
  { image: "/reference/clone/archive-v.jpg", label: "CH V" },
  { image: "/reference/clone/archive-vi.jpg", label: "CH VI" },
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/about-us" }),
  description:
    "Polite Society is a Mumbai-based everyday luxury label blending tailoring with a nonconformist spirit.",
  openGraph: buildOpenGraph({
    description:
      "Polite Society is a Mumbai-based everyday luxury label blending tailoring with a nonconformist spirit.",
    title: "About Us",
    type: "website",
    url: "/pages/about-us",
  }),
  title: "About Us",
};

export default function AboutPage() {
  return (
    <Page className="pt-0 pb-24">
      <section aria-labelledby="about-title" className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface sm:aspect-[2/1]">
          <Image
            alt="Polite Society campaign"
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="/reference/clone/about-hero.png"
          />
          <div className="absolute inset-0 bg-black/15" />
          <h1
            className="absolute bottom-6 left-5 text-lg uppercase tracking-wider text-white md:left-[30px] md:text-2xl"
            id="about-title"
          >
            About Us
          </h1>
        </div>
      </section>

      <Container>
        <nav aria-label="About sections" className="border-b border-rule">
          <ul
            className="flex gap-6 overflow-x-auto py-4 text-2xs uppercase tracking-wider [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
          >
            {SECTIONS.map((section) => (
              <li className="shrink-0" key={section.href}>
                <Link className="transition-opacity hover:opacity-60" href={section.href}>
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-20 pt-14 md:gap-28">
          <section className="grid scroll-mt-24 gap-6 md:grid-cols-[1fr_1.4fr]" id="about">
            <h2 className="text-2xs uppercase tracking-wider">About Polite</h2>
            <div className="grid gap-4 text-sm leading-[22px] font-light tracking-wide text-muted-foreground">
              <p>
                Polite Society is a Mumbai-based everyday luxury label that blends tailoring with a
                nonconformist spirit. Designed to transcend seasons and trends, our collections
                balance femininity, craftsmanship, and wearability.
              </p>
              <p>
                Every piece is thoughtfully created with a focus on fit, fabric, and finish,
                becoming a lasting part of an everyday wardrobe.
              </p>
            </div>
          </section>

          <section className="grid scroll-mt-24 gap-6 md:grid-cols-2 md:items-start" id="founder">
            <div className="relative aspect-[3/4] overflow-hidden bg-surface">
              <Image
                alt="Surmai Jain, founder of Polite Society"
                className="object-cover"
                fill
                sizes="100vw"
                src="/reference/clone/about-founder.png"
              />
            </div>
            <div className="grid gap-4 md:pt-6">
              <h2 className="text-2xs uppercase tracking-wider">Founder</h2>
              <p className="text-sm leading-[22px] font-light tracking-wide text-muted-foreground">
                Surmai Jain studied Marketing &amp; Communication at NIFT Mumbai &amp; FIT New York.
                She grew up across varied cultures in India and Armenia, and noticed how
                society&apos;s expectations often overshadow individuality. Through the brand, she
                wanted to make space for people to feel like the best, most honest version of
                themselves.
              </p>
            </div>
          </section>

          <section className="grid scroll-mt-24 gap-6" id="philosophy">
            <h2 className="text-2xs uppercase tracking-wider">Brand Philosophy</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {VALUES.map((value) => (
                <figure className="grid gap-2" key={value.label}>
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    <Image
                      alt={value.label}
                      className="object-cover"
                      fill
                      sizes="100vw"
                      src={value.image}
                    />
                  </div>
                  <figcaption className="text-2xs uppercase tracking-wider">
                    {value.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="grid scroll-mt-24 gap-6" id="store">
            <h2 className="text-2xs uppercase tracking-wider">Flagship Store</h2>
            <div className="relative aspect-[16/9] overflow-hidden bg-surface">
              <Image
                alt="Polite Society flagship store in Bandra West"
                className="object-cover"
                fill
                sizes="100vw"
                src="/reference/clone/about-store.png"
              />
            </div>
            <div className="grid gap-4 text-sm leading-[22px] font-light tracking-wide text-muted-foreground md:grid-cols-2">
              <p>
                An extension of the Polite Society world. A space to experience the collections up
                close, discover the details and find pieces that become part of your everyday.
              </p>
              <p>
                Shop No. 1, Solace Apartment, 33rd Road, Bandra West, Mumbai
                <br />
                Monday – Sunday, 11am – 8pm
              </p>
            </div>
          </section>

          <section className="grid scroll-mt-24 gap-6" id="atelier">
            <h2 className="text-2xs uppercase tracking-wider">Atelier</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <Image
                  alt="Inside the Polite Society atelier"
                  className="object-cover"
                  fill
                  sizes="100vw"
                  src="/reference/clone/about-atelier.png"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <Image
                  alt="Pattern making at the Polite Society studio"
                  className="object-cover"
                  fill
                  sizes="100vw"
                  src="/reference/clone/about-studio.png"
                />
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-[22px] font-light tracking-wide text-muted-foreground">
              Where the clothes take shape. Our atelier is where ideas become garments. From the
              first cut to the final stitch, each piece moves through a considered process of
              pattern, construction and finishing, bringing together skilled hands, precise
              craftsmanship and an attention to detail that defines Polite Society.
            </p>
          </section>

          <section className="grid scroll-mt-24 gap-6" id="archive">
            <h2 className="text-2xs uppercase tracking-wider">Archive</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {ARCHIVE.map((entry) => (
                <figure className="grid gap-2" key={entry.label}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <Image
                      alt={entry.label}
                      className="object-cover"
                      fill
                      sizes="100vw"
                      src={entry.image}
                    />
                  </div>
                  <figcaption className="text-2xs uppercase tracking-wider">
                    {entry.label}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="text-2xs uppercase tracking-wider text-muted-foreground">
              {shopConfig.site.name} · Mumbai
            </p>
          </section>
        </div>
      </Container>
    </Page>
  );
}
