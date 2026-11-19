import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";

import { MediaTile } from "@/components/home/media-tile";
import { ProductRow } from "@/components/home/product-row";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const CATEGORY_TILES = [
  {
    href: "/collections/women",
    image: "/reference/clone/lookbook-01.jpg",
    label: "Shop for Women",
  },
  {
    href: "/collections/unisex-1",
    image: "/reference/clone/lookbook-men.jpg",
    label: "Shop for Men",
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
  { href: "/collections/corsets", image: "/reference/editorial-corsets.jpg", label: "Corsets" },
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
    alt: "",
    fill: true,
    sizes: "100vw",
    src: "/reference/hero-desktop.jpg",
  });
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    alt: "",
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
    <Page className="flex flex-col gap-2.5 pt-0">
      <section aria-label="Campaign">
        <div className="relative h-[calc(100svh-var(--header-total-h))] overflow-hidden bg-surface desktop:aspect-[1440/700] desktop:h-auto">
          <CampaignImage />
          <div aria-hidden="true" className="absolute inset-0 bg-paper/30" />
          <h1 className="type-display-lg absolute inset-x-0 top-[41%] px-3 text-center text-ink desktop:px-(--gutter)">
            Control Your Narrative
          </h1>
          <Button
            className="absolute inset-x-0 bottom-11 mx-auto w-fit"
            render={<Link href="/collections/all" />}
            size="lg"
            variant="outline"
          >
            Explore Collections
          </Button>
        </div>
      </section>

      <section aria-label="New arrivals">
        <ProductRow handle="new-in" />
      </section>

      <section aria-label="Shop by category" className="grid grid-cols-1 desktop:grid-cols-2">
        {CATEGORY_TILES.map((tile) => (
          <MediaTile
            className="aspect-[10/9] desktop:aspect-[720/700]"
            href={tile.href}
            image={tile.image}
            key={tile.href}
            label={tile.label}
          />
        ))}
      </section>

      <section aria-label="Get the look" className="grid gap-6 bg-surface px-(--gutter) py-10">
        <h2 className="type-h2">Get the Look</h2>
        <div className="flex snap-x gap-6 overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:overflow-visible">
          {LOOK_TILES.map((tile) => (
            <MediaTile
              className="w-[min(68vw,268px)] shrink-0 snap-start aspect-[2/3] desktop:w-auto"
              href={tile.href}
              image={tile.image}
              key={tile.href}
              label={tile.label}
            />
          ))}
        </div>
      </section>

      <section
        aria-label="Exclusives"
        className="relative aspect-[39/70] overflow-hidden bg-surface desktop:aspect-[1440/700]"
      >
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="100vw"
          src="/reference/hero-desktop.jpg"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-paper/30" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-(--gutter) pb-20.5">
          <h2 className="type-display desktop:type-display-lg text-center text-ink">Exclusives</h2>
          <Button render={<Link href="/collections/new-in" />} size="lg" variant="outline">
            Explore Collection
          </Button>
        </div>
      </section>

      <section aria-label="Bestsellers">
        <ProductRow handle="bestsellers" />
      </section>

      <section aria-label="Stories" className="grid grid-cols-1 desktop:grid-cols-2">
        {STORY_TILES.map((tile) => (
          <MediaTile
            className="aspect-[10/9] desktop:aspect-[720/700]"
            href={tile.href}
            image={tile.image}
            key={tile.href}
            label={tile.label}
          />
        ))}
      </section>
    </Page>
  );
}
