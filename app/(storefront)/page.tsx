import type { Metadata } from "next";
import Image from "next/image";

import { MediaTile } from "@/components/home/media-tile";
import { ProductRow } from "@/components/home/product-row";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const MARQUEE_COPY =
  "Lorem ipsum means something before it means anything. Originally used as placeholder text, it exists to hold space for meaning that has yet to be written. We chose the name because we see fashion in much the same way.";

const CATEGORY_TILES = [
  {
    href: "/collections/womenswear",
    image: "/reference/clone/lookbook-01.jpg",
    label: "Shop for Women",
    labelClassName:
      "bg-gradient-to-t from-black/45 via-black/15 to-transparent px-9 pt-16 pb-10.5 text-inverse",
  },
  {
    href: "/collections/menswear",
    image: "/reference/clone/lookbook-men.jpg",
    label: "Shop for Men",
    labelClassName:
      "bg-gradient-to-t from-paper/70 via-paper/25 to-transparent px-9 pt-16 pb-10.5 text-ink",
  },
];

const DESKTOP_CATEGORY_TILES = [
  {
    href: "/collections/womenswear",
    image: "/reference/design-i/home/collection-denim.jpg",
    label: "Shop for Women",
    labelClassName: "px-9 pb-6.5 text-inverse",
  },
  {
    href: "/collections/menswear",
    image: "/reference/design-i/home/collection-tailoring.jpg",
    label: "Shop for Men",
    labelClassName: "px-9 pb-6.5 text-ink",
  },
];

const SECOND_CATEGORY_TILES = [
  {
    href: "/collections/dresses",
    image: "/reference/editorial-dresses.jpg",
    label: "Dresses",
    labelClassName:
      "bg-gradient-to-t from-paper/70 via-paper/25 to-transparent px-9 pt-16 pb-10.5 text-ink",
  },
  {
    href: "/collections/racer-backs",
    image: "/reference/editorial-elevated.jpg",
    label: "Racer Backs",
    labelClassName:
      "bg-gradient-to-t from-black/45 via-black/15 to-transparent px-9 pt-16 pb-10.5 text-inverse",
  },
];

const LOOK_TILES = [
  { href: "/collections/new-in", image: "/reference/editorial-core.jpg" },
  { href: "/collections/womenswear", image: "/reference/editorial-essentials.jpg" },
  { href: "/collections/dresses", image: "/reference/editorial-elevated.jpg" },
  { href: "/collections/racer-backs", image: "/reference/editorial-corsets.jpg" },
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
    <Page className="-mt-(--header-total-h) pt-0">
      <section aria-label="Campaign" className="relative">
        <div className="relative h-svh overflow-hidden bg-neutral-200 desktop:aspect-[1440/812] desktop:h-auto">
          <Image
            alt=""
            className="object-cover object-[80%_50%] mix-blend-color-burn desktop:object-center"
            fill
            priority
            quality={90}
            sizes="100vw"
            src="/reference/design-i/home/hero-desktop.jpg"
          />
          <h1 className="type-display-lg absolute inset-x-0 top-[42.5%] px-3 text-center text-ink desktop:sr-only">
            Control Your Nurrative
          </h1>
          <Button
            className="absolute inset-x-0 bottom-[117px] mx-auto w-fit desktop:hidden"
            render={<Link href="/collections/new-in" />}
            size="lg"
            variant="outline"
          >
            Explore Collections
          </Button>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden desktop:block"
          >
            <span className="absolute top-[75%] left-[45.07%] flex size-6 items-center justify-center rounded-full bg-paper/60">
              <span className="size-[15.11px] rounded-full bg-paper/60" />
            </span>
            <span className="absolute top-[85.96%] left-[18.68%] flex size-6 items-center justify-center rounded-full bg-paper/60">
              <span className="size-[15.11px] rounded-full bg-paper/60" />
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 -bottom-[18px] z-10 hidden h-[50px] overflow-hidden bg-paper desktop:block">
          <p className="sr-only">{MARQUEE_COPY}</p>
          <div
            aria-hidden="true"
            className="flex h-full w-max animate-[marquee_40s_linear_infinite] items-center motion-reduce:animate-none"
          >
            <span className="type-marquee pr-12 pl-6 whitespace-nowrap">{MARQUEE_COPY}</span>
            <span className="type-marquee pr-12 pl-6 whitespace-nowrap">{MARQUEE_COPY}</span>
          </div>
        </div>
      </section>

      <section aria-label="New arrivals">
        <ProductRow handle="new-in" variant="home" />
      </section>

      <section aria-label="Shop by category" className="hidden desktop:block">
        <div className="grid grid-cols-2 gap-6 px-6">
          {DESKTOP_CATEGORY_TILES.map((tile) => (
            <MediaTile
              className="aspect-[684/700]"
              href={tile.href}
              image={tile.image}
              key={tile.href}
              label={tile.label}
              labelClassName={tile.labelClassName}
            />
          ))}
        </div>
        <Link
          aria-label="Explore the campaign"
          className="relative mx-6 mt-6 block aspect-[1392/369] overflow-hidden bg-ink"
          href="/collections/new-in"
        >
          <Image
            alt=""
            className="object-cover"
            fill
            quality={90}
            sizes="100vw"
            src="/reference/design-i/home/banner.jpg"
          />
        </Link>
      </section>

      <section aria-label="Shop by category" className="desktop:hidden">
        {CATEGORY_TILES.map((tile) => (
          <MediaTile
            className="aspect-[10/9]"
            href={tile.href}
            image={tile.image}
            key={tile.href}
            label={tile.label}
            labelClassName={tile.labelClassName}
          />
        ))}
      </section>

      <section aria-label="Get the look" className="bg-surface px-6 pt-10 pb-10 desktop:hidden">
        <h2 className="type-h2">Get the Look</h2>
        <div className="mt-6 flex snap-x gap-6 overflow-x-auto scrollbar-hide">
          {LOOK_TILES.map((tile) => (
            <MediaTile
              className="w-[68.6vw] shrink-0 snap-start aspect-[2/3]"
              href={tile.href}
              image={tile.image}
              key={tile.href}
            />
          ))}
        </div>
      </section>

      <section
        aria-label="Exclusives"
        className="relative h-[700px] overflow-hidden desktop:hidden"
      >
        <Image
          alt=""
          className="object-cover"
          fill
          quality={90}
          sizes="100vw"
          src="/reference/hero-mobile.jpg"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-6 pb-20">
          <h2 className="type-display-lg text-center text-inverse">Exclusives</h2>
          <Button render={<Link href="/collections/new-in" />} size="lg" variant="overlay">
            Explore Collection
          </Button>
        </div>
      </section>

      <section aria-label="More to explore" className="desktop:hidden">
        <ProductRow handle="menswear" variant="home" />
      </section>

      <section aria-label="Collections" className="desktop:hidden">
        {SECOND_CATEGORY_TILES.map((tile) => (
          <MediaTile
            className="aspect-[10/9]"
            href={tile.href}
            image={tile.image}
            key={tile.href}
            label={tile.label}
            labelClassName={tile.labelClassName}
          />
        ))}
      </section>
    </Page>
  );
}
