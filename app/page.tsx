import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";

import { MediaTile } from "@/components/home/media-tile";
import { ProductRow } from "@/components/home/product-row";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const EDITORIAL_TILES = [
  {
    href: "/collections/women",
    image: "/reference/clone/lookbook-01.jpg",
    watermark: "Women",
  },
  {
    href: "/collections/unisex-1",
    image: "/reference/clone/lookbook-02.jpg",
    watermark: "Men",
  },
];

const LOOK_TILES = [
  { href: "/collections/core", image: "/reference/editorial-core.jpg", label: "Core" },
  {
    href: "/collections/essentials",
    image: "/reference/editorial-essentials.jpg",
    label: "Essentials",
  },
  { href: "/collections/signature", image: "/reference/editorial-elevated.jpg", label: "Elevated" },
];

const STORY_TILES = [
  {
    href: "/pages/about-us#store",
    image: "/reference/clone/lookbook-05.jpg",
    label: "Flagship Store",
  },
  { href: "/blogs/journal-2", image: "/reference/clone/lookbook-06.jpg", label: "Journal" },
];

// Art direction: <picture> fetches only the viewport's campaign image, so mobile never downloads the desktop hero.
function CampaignImage() {
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    alt: `${shopConfig.site.name} campaign`,
    fill: true,
    sizes: "100vw",
    src: "/reference/hero-desktop.jpg",
  });
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    alt: `${shopConfig.site.name} campaign`,
    fill: true,
    loading: "eager",
    sizes: "100vw",
    src: "/reference/hero-mobile.jpg",
  });

  return (
    <picture>
      <source media="(min-width: 1100px)" srcSet={desktopSrcSet} />
      <img
        {...mobileProps}
        className="object-cover"
        decoding="async"
        fetchPriority="high"
        srcSet={mobileSrcSet}
      />
    </picture>
  );
}

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
        <Link className="block" href="/collections/new-in">
          <div className="relative h-[calc(100svh-var(--header-total-h))] overflow-hidden desktop:aspect-[1440/784] desktop:h-auto">
            <CampaignImage />
          </div>
        </Link>
      </section>

      <section aria-label="New arrivals" className="px-(--gutter) py-10">
        <ProductRow handle="new-in" />
      </section>

      <section aria-label="Shop by category" className="grid grid-cols-1 desktop:grid-cols-2">
        {EDITORIAL_TILES.map((tile) => (
          <MediaTile
            className="aspect-[3/5] desktop:aspect-[720/893]"
            href={tile.href}
            image={tile.image}
            key={tile.watermark}
            watermark={tile.watermark}
          />
        ))}
      </section>

      <section aria-label="Get the look" className="grid gap-10 px-(--gutter) py-20">
        <h2 className="type-h2 text-center">Get the Look</h2>
        <div className="grid grid-cols-1 gap-(--grid-gap) desktop:grid-cols-3">
          {LOOK_TILES.map((tile) => (
            <MediaTile
              className="aspect-[480/557]"
              href={tile.href}
              image={tile.image}
              key={tile.label}
              label={tile.label}
              labelTone="inverse"
            />
          ))}
        </div>
      </section>

      <section aria-label="Exclusives">
        <Link
          className="group relative block aspect-[4/5] overflow-hidden bg-surface desktop:aspect-[1440/700]"
          href="/collections/new-in"
        >
          <Image
            alt=""
            className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
            fill
            sizes="100vw"
            src="/reference/hero-desktop.jpg"
          />
          <span className="absolute inset-0 flex items-center justify-center gap-10">
            <span
              aria-hidden="true"
              className="type-display desktop:type-watermark-lg text-inverse/50"
            >
              Exclusives
            </span>
            <span
              aria-hidden="true"
              className="size-17 rounded-full border-[19.5px] border-inverse/50"
            />
          </span>
        </Link>
      </section>

      <section aria-label="Bestsellers" className="px-(--gutter) py-10">
        <ProductRow handle="bestsellers" />
      </section>

      <section aria-label="Stories" className="grid grid-cols-1 desktop:grid-cols-2">
        {STORY_TILES.map((tile) => (
          <MediaTile
            className="aspect-[4/5] desktop:aspect-[720/700]"
            href={tile.href}
            image={tile.image}
            key={tile.label}
            label={tile.label}
            labelTone="inverse"
          />
        ))}
      </section>
    </Page>
  );
}
