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
  { href: "/pages/about-us#store", image: "/reference/tile-flagship.jpg", label: "Flagship Store" },
  { href: "/blogs/journal-2", image: "/reference/tile-journal.jpg", label: "Journal" },
  { href: "/pages/care-guide", image: "/reference/tile-careguide.jpg", label: "Care Guide" },
  { href: "/pages/about-us", image: "/reference/tile-our-world.jpg", label: "Our World" },
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
      <h1 className="sr-only">{shopConfig.site.name} | High Fashion Clothing</h1>

      <section aria-label="Campaign">
        <Link className="block" href="/collections/chapter-x">
          <div className="relative h-[calc(100svh-91px)] overflow-hidden desktop:aspect-[1440/784] desktop:h-auto">
            <Image
              alt={`${shopConfig.site.name} campaign`}
              className="object-cover desktop:hidden"
              fill
              loading="eager"
              sizes="100vw"
              src="/reference/hero-mobile.jpg"
            />
            <Image
              alt={`${shopConfig.site.name} campaign`}
              className="hidden object-cover desktop:block"
              fill
              priority
              sizes="100vw"
              src="/reference/hero-desktop.jpg"
            />
          </div>
        </Link>
      </section>

      <section aria-label="Shop by category" className="grid grid-cols-1 desktop:grid-cols-2">
        {EDITORIAL_TILES.map((tile) => (
          <Link
            className="group relative block aspect-[2/3] overflow-hidden bg-surface desktop:aspect-[720/893]"
            href={tile.href}
            key={tile.label}
          >
            <Image
              alt=""
              className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
              fill
              sizes="100vw"
              src={tile.image}
            />
            <span className="type-h2 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-(--gutter) pt-12 pb-5 text-inverse">
              {tile.label}
            </span>
          </Link>
        ))}
      </section>

      <HomeProductRail />

      <section aria-label="Collection edits" className="grid grid-cols-1 desktop:grid-cols-3">
        {COLLECTION_TILES.map((tile) => (
          <Link
            className="group relative block aspect-[480/557] overflow-hidden bg-surface"
            href={tile.href}
            key={tile.label}
          >
            <Image
              alt=""
              className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
              fill
              sizes="100vw"
              src={tile.image}
            />
            <span className="type-h3 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-(--gutter) pt-10 pb-4 text-inverse">
              {tile.label}
            </span>
          </Link>
        ))}
      </section>

      <section aria-label={`Discover ${shopConfig.site.name}`} className="pb-10 pt-10">
        <div className="grid grid-cols-2 desktop:grid-cols-4">
          {LINK_TILES.map((tile) => (
            <Link className="group grid content-start" href={tile.href} key={tile.label}>
              <span className="relative block aspect-square overflow-hidden bg-surface">
                <Image
                  alt=""
                  className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
                  fill
                  sizes="100vw"
                  src={tile.image}
                />
              </span>
              <span className="type-h4 px-(--gutter) pt-2.5">{tile.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  );
}
