import type { Metadata } from "next";
import Image from "next/image";

import { HomeProductRail } from "@/components/product/home-product-rail";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const EDITORIAL_TILES = [
  { href: "/collections/corsets", image: "/reference/editorial-corsets.jpg", label: "Corsets" },
  {
    href: "/collections/dresses-and-jumpsuits",
    image: "/reference/editorial-dresses.jpg",
    label: "Dresses & Jumpsuits",
  },
];

const COLLECTION_TILES = [
  { href: "/collections/core", image: "/reference/editorial-core.jpg", label: "Core" },
  {
    href: "/collections/essentials",
    image: "/reference/editorial-essentials.jpg",
    label: "Essentials",
  },
  { href: "/collections/signature", image: "/reference/editorial-elevated.jpg", label: "Elevated" },
];

const LINK_TILES = [
  { href: "/pages/contact", image: "/reference/tile-flagship.jpg", label: "Flagship Store" },
  { href: "/blogs/news", image: "/reference/tile-journal.jpg", label: "Journal" },
  { href: "/pages/contact", image: "/reference/tile-careguide.jpg", label: "Polite Careguide" },
  { href: "/blogs/news", image: "/reference/tile-our-world.jpg", label: "Our World" },
];

export async function generateMetadata(): Promise<Metadata> {
  const title = "Everyday Luxury Clothing";
  const description = "Explore featured clothing, curated collections, and seasonal campaigns.";
  return {
    title: `${title} | ${shopConfig.site.name}`,
    description,
    alternates: buildAlternates({ pathname: "/" }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/",
      type: "website",
    }),
  };
}

export default function HomePage() {
  return (
    <Page className="pt-0">
      <h1 className="sr-only">Polite Society | Everyday Luxury Clothing | Made In India</h1>

      <section aria-label="Campaign">
        <Link className="block" href="/collections/new-in">
          <div className="relative h-[calc(100svh-91px)] overflow-hidden md:h-auto md:aspect-[1440/784]">
            <Image
              alt="Polite Society campaign"
              className="object-cover md:hidden"
              fill
              priority
              sizes="100vw"
              src="/reference/hero-mobile.jpg"
            />
            <Image
              alt="Polite Society campaign"
              className="hidden object-cover md:block"
              fill
              priority
              sizes="100vw"
              src="/reference/hero-desktop.jpg"
            />
          </div>
        </Link>
      </section>

      <section aria-label="Shop by category" className="grid grid-cols-1 gap-[3px] md:grid-cols-2">
        {EDITORIAL_TILES.map((tile) => (
          <Link
            className="group relative block aspect-[4/5] overflow-hidden bg-surface"
            href={tile.href}
            key={tile.label}
          >
            <Image
              alt=""
              className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.03]"
              fill
              sizes="100vw"
              src={tile.image}
            />
            <span className="absolute bottom-3 left-4 text-2xs uppercase tracking-wider text-white">
              {tile.label}
            </span>
          </Link>
        ))}
      </section>

      <HomeProductRail />

      <section aria-label="Collection edits" className="grid grid-cols-1 gap-[3px] md:grid-cols-3">
        {COLLECTION_TILES.map((tile) => (
          <Link
            className="group relative block aspect-[480/557] overflow-hidden bg-surface"
            href={tile.href}
            key={tile.label}
          >
            <Image
              alt=""
              className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.03]"
              fill
              sizes="100vw"
              src={tile.image}
            />
            <span className="absolute bottom-3 left-4 text-2xs uppercase tracking-wider text-white">
              {tile.label}
            </span>
          </Link>
        ))}
      </section>

      <section aria-label="Discover Polite Society" className="pb-28 pt-10">
        <div className="grid grid-cols-2 gap-x-[3px] gap-y-6 md:grid-cols-4">
          {LINK_TILES.map((tile) => (
            <Link className="group grid content-start" href={tile.href} key={tile.label}>
              <span className="relative block aspect-square overflow-hidden bg-surface">
                <Image
                  alt=""
                  className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.03]"
                  fill
                  sizes="100vw"
                  src={tile.image}
                />
              </span>
              <span className="mt-2.5 text-2xs uppercase tracking-wider">{tile.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  );
}
