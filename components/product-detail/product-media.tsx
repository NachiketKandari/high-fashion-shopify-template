"use client";

import { cn } from "cn";
import Image, { getImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { preload } from "react-dom";

import { AutoPlayVideo } from "@/components/ui/auto-play-video";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import type { Image as ImageType, MediaItem } from "@/lib/media/types";

import { Lightbox, LightboxTrigger } from "./lightbox";

type MediaSlot = MediaItem | { type: "placeholder" };

function mediaKey(item: MediaSlot) {
  if (item.type === "image") return item.image.url;
  if (item.type === "video") return item.video.url;
  return "placeholder";
}

// `preload` alone does not set high fetch priority; other images stay lazy so the hidden carousel or grid never downloads.
const LCP_IMAGE_PROPS = { fetchPriority: "high", loading: "eager", preload: true } as const;

const LAZY_IMAGE_PROPS = { decoding: "async", fetchPriority: "low", loading: "lazy" } as const;

// Tailwind `lg`, where the stacked gallery replaces the carousel.
const DESKTOP_MEDIA = "(min-width: 1100px)";
// Only the first stacked image is above the fold; later images stay lazy on both layouts.
const DESKTOP_GRID_PRELOAD_COUNT = 1;
// Design I draws a 800x1432 hero over two 2-up rows; the rest stay available in the mobile carousel.
const DESKTOP_GRID_LIMIT = 5;

// The preload must share the <img>'s srcset and sizes, or the browser downloads the tile twice.
function preloadDesktopGridImage(image: ImageType) {
  const { props } = getImageProps({
    src: image.url,
    alt: "",
    fill: true,
    sizes: "100vw",
  });
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    media: DESKTOP_MEDIA,
  });
}

// The next gallery image is often the first swipe; warm the optimizer after the LCP image settles.
function prefetchMediaImage(image: ImageType) {
  const { props } = getImageProps({
    src: image.url,
    alt: "",
    fill: true,
    sizes: "100vw",
  });
  const imageElement = new window.Image();
  imageElement.decoding = "async";
  imageElement.setAttribute("fetchpriority", "low");
  if (props.srcSet) imageElement.srcset = props.srcSet;
  if (props.sizes) imageElement.sizes = props.sizes;
  imageElement.src = props.src;
}

function canPrefetchMedia() {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;
  return !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType ?? "");
}

function useNearViewport(enabled: boolean, rootMargin = "300px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(enabled);

  useEffect(() => {
    const node = ref.current;
    if (enabled || near || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, near, rootMargin]);

  return [ref, enabled || near] as const;
}

function MediaImage({
  item,
  title,
  idx,
  priority,
  className,
}: {
  item: Extract<MediaItem, { image: ImageType; type: "image" }>;
  title: string;
  idx: number;
  priority: boolean;
  className?: string;
}) {
  return (
    <Image
      src={item.image.url}
      alt={item.image.altText || `${title} image ${idx + 1}`}
      height={item.image.height}
      width={item.image.width}
      className={cn("absolute inset-0 size-full object-cover", className)}
      sizes="100vw"
      {...(priority ? LCP_IMAGE_PROPS : LAZY_IMAGE_PROPS)}
      draggable={false}
    />
  );
}

function MediaVideo({
  item,
  priority,
  className,
}: {
  item: Extract<MediaItem, { type: "video" }>;
  priority: boolean;
  className?: string;
}) {
  return (
    <AutoPlayVideo
      src={item.video.url}
      previewImage={
        item.video.previewImage
          ? {
              src: item.video.previewImage.url,
              alt: item.video.previewImage.altText || "",
            }
          : null
      }
      previewImageFetchPriority={priority ? "high" : "auto"}
      previewImageLoading={priority ? "eager" : "lazy"}
      className={cn("h-full w-full scale-[1.04] object-cover", className)}
    />
  );
}

function Carousel({ mediaItems, title }: { mediaItems: MediaSlot[]; title: string }) {
  return (
    <div
      aria-label={`${title} images`}
      className="focus-ring relative flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-hide"
      role="region"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      tabIndex={0}
    >
      {mediaItems.map((item, idx) => (
        <CarouselSlide
          key={`${mediaKey(item)}-${idx}`}
          item={item}
          title={title}
          idx={idx}
          priority={idx === 0}
        />
      ))}
    </div>
  );
}

function GridItem({
  item,
  title,
  idx,
  priority,
  className,
}: {
  item: MediaSlot;
  title: string;
  idx: number;
  priority: boolean;
  className?: string;
}) {
  const [ref, near] = useNearViewport(priority);
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)}>
      {!near ? (
        <div className="size-full bg-surface" />
      ) : item.type === "video" ? (
        <MediaVideo item={item} priority={priority} />
      ) : item.type === "placeholder" ? (
        <ImagePlaceholder className="size-full" />
      ) : (
        <LightboxTrigger image={item.image}>
          <MediaImage item={item} title={title} idx={idx} priority={priority} />
        </LightboxTrigger>
      )}
    </div>
  );
}

function CarouselSlide({
  item,
  title,
  idx,
  priority,
}: {
  item: MediaSlot;
  title: string;
  idx: number;
  priority: boolean;
}) {
  const [ref, near] = useNearViewport(priority);
  return (
    <div
      ref={ref}
      className="relative shrink-0 w-full snap-start snap-always overflow-hidden aspect-[2/3]"
    >
      {!near ? (
        <div className="size-full bg-surface" />
      ) : item.type === "video" ? (
        <MediaVideo item={item} priority={priority} />
      ) : item.type === "placeholder" ? (
        <ImagePlaceholder className="size-full" />
      ) : (
        <MediaImage item={item} title={title} idx={idx} priority={priority} />
      )}
    </div>
  );
}

function Grid({ mediaItems, title }: { mediaItems: MediaSlot[]; title: string }) {
  const visible = mediaItems.slice(0, DESKTOP_GRID_LIMIT);
  for (const [idx, item] of visible.entries()) {
    if (idx >= DESKTOP_GRID_PRELOAD_COUNT) break;
    // Tile 0 is the LCP image and already preloaded via next/image's `preload` prop.
    if (idx > 0 && item.type === "image") preloadDesktopGridImage(item.image);
  }

  const [hero, ...tiles] = visible;
  return (
    <Lightbox label={title}>
      <div className="grid grid-cols-2 gap-0">
        <div className="relative col-span-2 aspect-[800/1432] overflow-hidden">
          {hero ? (
            hero.type === "video" ? (
              <MediaVideo item={hero} priority />
            ) : hero.type === "placeholder" ? (
              <ImagePlaceholder className="size-full" />
            ) : (
              <LightboxTrigger image={hero.image}>
                <MediaImage item={hero} title={title} idx={0} priority />
              </LightboxTrigger>
            )
          ) : null}
        </div>
        {tiles.map((item, idx) => (
          <GridItem
            className="aspect-[3/4]"
            item={item}
            title={title}
            idx={idx + 1}
            key={`${mediaKey(item)}-${idx}`}
            priority={false}
          />
        ))}
      </div>
    </Lightbox>
  );
}

export function ProductMedia({
  colorImage,
  media,
  title,
  className,
}: {
  colorImage?: ImageType | null;
  media: MediaItem[];
  title: string;
  className?: string;
}) {
  const hasColorSlot = !!colorImage;
  const isEmpty = media.length === 0 && !hasColorSlot;
  const mediaItems = useMemo<MediaSlot[]>(() => {
    if (isEmpty) return [{ type: "placeholder" }];
    return colorImage ? [{ type: "image", image: colorImage }, ...media] : media;
  }, [colorImage, isEmpty, media]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const images = mediaItems.filter(
      (item): item is Extract<MediaItem, { type: "image" }> => item.type === "image",
    );
    // With a colour slot the first media item is the image after the LCP; without one, the LCP is mediaItems[0].
    const next = hasColorSlot ? images[1] : mediaItems[0]?.type === "image" ? images[1] : images[0];
    if (!root || !next || !canPrefetchMedia()) return;

    let cancelled = false;
    let timeoutHandle: number | undefined;
    const prefetch = () => {
      if (!cancelled && document.visibilityState === "visible") {
        prefetchMediaImage(next.image);
      }
    };
    const schedule = () => {
      if (cancelled) return;
      timeoutHandle = window.setTimeout(prefetch, 250);
    };
    const first = root.querySelector<HTMLImageElement>('img[fetchpriority="high"]');
    const afterFirst = () => {
      if (cancelled) return;
      if (first?.decode) {
        first
          .decode()
          .catch(() => undefined)
          .finally(schedule);
      } else {
        schedule();
      }
    };

    if (!first) {
      schedule();
    } else if (first.complete) {
      afterFirst();
    } else {
      first.addEventListener("load", afterFirst, { once: true });
    }

    return () => {
      cancelled = true;
      first?.removeEventListener("load", afterFirst);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [hasColorSlot, mediaItems]);

  return (
    <div className={className} ref={rootRef} data-slot="product-gallery">
      <div className="desktop:hidden">
        <Carousel key={mediaItems.map(mediaKey).join(",")} mediaItems={mediaItems} title={title} />
      </div>
      <div className="hidden desktop:block desktop:pt-[calc(75px-var(--header-bar-h))]">
        <Grid mediaItems={mediaItems} title={title} />
      </div>
    </div>
  );
}
