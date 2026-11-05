import Image from "next/image";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { getProductRecommendations } from "@/lib/product/server";
import type { ProductCard } from "@/lib/product/types";

export async function ComplementaryProducts({
  handle,
  limit,
  title,
}: {
  handle: string;
  limit: number;
  title: string;
}) {
  const complementary = await getProductRecommendations({ handle, intent: "COMPLEMENTARY" });
  if (complementary.length === 0) return null;
  return (
    <div className="grid gap-2.5" data-slot="complementary-products">
      <h2 className="type-h4 text-ink-muted">{title}</h2>
      <ul className="grid gap-2.5">
        {complementary.slice(0, limit).map((product: ProductCard) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.handle}`}
              className="type-body-sm flex min-h-9 cursor-pointer items-center gap-2.5 border border-rule p-2.5 transition-colors hover:border-ink/30"
            >
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  width={48}
                  height={48}
                  sizes="100vw"
                  className="size-12 object-cover"
                />
              ) : (
                <ImagePlaceholder className="size-12 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{product.title}</span>
              <Price
                amount={product.price.amount}
                className="type-body-sm shrink-0"
                currencyCode={product.price.currencyCode}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
