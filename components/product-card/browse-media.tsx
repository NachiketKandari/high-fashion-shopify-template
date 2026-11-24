"use client";

import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { useCardView } from "@/lib/collections/client";
import type { CardView } from "@/lib/collections/types";
import type { Image as StorefrontImage } from "@/lib/media/types";

interface BrowseProductMediaProps {
  featuredImage: StorefrontImage | null;
  hoverImage?: StorefrontImage | null;
  href: string;
  loading: "eager" | "lazy";
  sizes: string[];
  title: string;
}

function imageClassName(view: CardView) {
  return cn(
    "object-cover",
    view === "model" ? "object-contain" : undefined,
    view === "item" ? "scale-125" : undefined,
  );
}

const ARROW_CLASS =
  "focus-ring pointer-events-auto flex size-9 cursor-pointer items-center justify-center bg-transparent text-ink opacity-0 transition-opacity duration-(--motion-base) ease-(--ease-standard) focus-visible:opacity-100 group-focus-within/card:opacity-100 group-hover/card:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none";

export function BrowseProductMedia({
  featuredImage,
  hoverImage,
  href,
  loading,
  sizes,
  title,
}: BrowseProductMediaProps) {
  const view = useCardView();

  return (
    <BrowseProductMediaGallery
      featuredImage={featuredImage}
      hoverImage={hoverImage}
      href={href}
      key={view}
      loading={loading}
      sizes={sizes}
      title={title}
      view={view}
    />
  );
}

function BrowseProductMediaGallery({
  featuredImage,
  hoverImage,
  href,
  loading,
  sizes,
  title,
  view,
}: BrowseProductMediaProps & { view: CardView }) {
  const images = [featuredImage, hoverImage].filter(
    (image): image is StorefrontImage => image !== null && image !== undefined,
  );
  const [activeIndex, setActiveIndex] = useState(view === "image" && images.length > 1 ? 1 : 0);
  const activeImage = images[activeIndex];
  const hasGallery = images.length > 1;
  const hasSizes = sizes.length > 0;

  return (
    <>
      <Link aria-hidden="true" className="absolute inset-0 block" href={href} tabIndex={-1}>
        {activeImage ? (
          // Render only the active image so the alternate photograph loads on arrow intent.
          <Image
            alt={activeIndex === 0 ? activeImage.altText || title : ""}
            className={imageClassName(view)}
            fill
            loading={activeIndex === 0 ? loading : "lazy"}
            sizes="100vw"
            src={activeImage.url}
          />
        ) : (
          <ImagePlaceholder className="size-full" />
        )}
      </Link>

      {hasGallery ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-2 top-0 z-10 flex items-center justify-between",
            hasSizes ? "bottom-11" : "bottom-0",
          )}
        >
          <button
            aria-label={`Previous image for ${title}`}
            className={ARROW_CLASS}
            onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)}
            type="button"
          >
            <ChevronLeftIcon aria-hidden="true" className="size-4" strokeWidth={1.25} />
          </button>
          <button
            aria-label={`Next image for ${title}`}
            className={ARROW_CLASS}
            onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
            type="button"
          >
            <ChevronRightIcon aria-hidden="true" className="size-4" strokeWidth={1.25} />
          </button>
        </div>
      ) : null}

      {hasSizes ? (
        // Display-only until ProductCard carries per-size availability.
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-11 translate-y-full items-center justify-between gap-2 overflow-hidden bg-paper px-6 transition-transform duration-(--motion-base) ease-(--ease-standard) group-focus-within/card:translate-y-0 group-hover/card:translate-y-0 pointer-coarse:hidden motion-reduce:transition-none">
          <span className="sr-only">Size range</span>
          {sizes.map((size) => (
            <span className="type-label min-w-0 truncate text-ink-muted" key={size}>
              {size}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
