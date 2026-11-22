import type { Metadata } from "next";
import Image from "next/image";

import { MediaTile } from "@/components/home/media-tile";
import { ProductRow } from "@/components/home/product-row";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const MARQUEE_COPY =
  "Lorem ipsum means something before it means anything. Originally used as placeholder text, it exists to hold space for meaning that has yet to be written. We chose the name because we see fashion in much the same way.";

const CATEGORY_LABEL_CLASS =
  "bg-gradient-to-t px-6 pt-16 pb-6 desktop:bg-none desktop:px-9 desktop:pt-0 desktop:pb-6.5";

const CATEGORY_TILES = [
  {
    href: "/collections/womenswear",
    image: "/reference/design-i/home/collection-denim.jpg",
    label: "Shop for Women",
    labelClassName: `${CATEGORY_LABEL_CLASS} from-black/45 via-black/15 to-transparent text-inverse`,
  },
  {
    href: "/collections/menswear",
    image: "/reference/design-i/home/collection-tailoring.jpg",
    label: "Shop for Men",
    labelClassName: `${CATEGORY_LABEL_CLASS} from-paper/85 via-paper/25 to-transparent text-ink`,
  },
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
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 desktop:aspect-[1440/812]">
          <Image
            alt=""
            className="object-cover object-[60%_50%] mix-blend-color-burn desktop:object-center"
            fill
            priority
            quality={90}
            sizes="100vw"
            src="/reference/design-i/home/hero-desktop.jpg"
          />
          <h1 className="sr-only">Control Your Nurrative</h1>
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

        <div className="absolute inset-x-0 -bottom-[18px] z-10 h-[50px] overflow-hidden bg-paper">
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

      <section>
        <h2 className="type-h2 sr-only">New arrivals</h2>
        <ProductRow handle="new-in" variant="home" />
      </section>

      <section>
        <h2 className="type-h2 sr-only">Shop by category</h2>
        <div className="grid tablet:grid-cols-2 tablet:gap-6 tablet:px-6">
          {CATEGORY_TILES.map((tile) => (
            <MediaTile
              className="aspect-square tablet:aspect-[684/700]"
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
          className="relative mx-6 mt-6 block aspect-[4/3] overflow-hidden bg-ink tablet:aspect-[2/1] desktop:aspect-[1392/369]"
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
    </Page>
  );
}
