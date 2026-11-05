import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";

export interface ArticleCardProps {
  article: BlogArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const href = `/blogs/${article.blogHandle}/${article.handle}`;
  const publishedAt = new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "long",
  }).format(new Date(article.publishedAt));
  return (
    <article className="group grid content-start gap-4">
      <Link className="relative aspect-3/2 overflow-hidden" href={href}>
        {article.image ? (
          <Image
            alt={article.image.altText}
            className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-hover:scale-[1.03]"
            fill
            sizes="100vw"
            src={article.image.url}
          />
        ) : (
          <ImagePlaceholder className="size-full bg-muted" />
        )}
      </Link>
      <div className="grid gap-2.5">
        <time className="type-label text-ink-muted" dateTime={article.publishedAt}>
          {publishedAt}
        </time>
        <h2 className="type-h3">
          <Link className="focus-ring inline-flex min-h-9 items-center hover:underline" href={href}>
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="type-body-sm line-clamp-3 text-ink-muted">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
