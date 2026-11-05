import { ArticleCard } from "@/components/blog/article-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import type { Blog } from "@/lib/blog/types";

export interface BlogIndexProps {
  blog: Blog;
}

export function BlogIndex({ blog }: BlogIndexProps) {
  return (
    <Page>
      <Container>
        <Sections>
          <h1 className="type-display">{blog.title}</h1>
          {blog.articles.length > 0 ? (
            <div className="grid gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
              {blog.articles.map((article) => (
                <ArticleCard article={article} key={article.handle} />
              ))}
            </div>
          ) : (
            <p className="type-body text-ink-muted">No articles found.</p>
          )}
        </Sections>
      </Container>
    </Page>
  );
}

export function BlogIndexSkeleton() {
  return (
    <Page aria-busy="true">
      <Container>
        <Sections>
          <Skeleton className="h-7 w-1/2" />
          <div className="grid gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div className="grid content-start gap-4" key={index}>
                <Skeleton className="aspect-3/2 w-full" />
                <div className="grid gap-2.5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Sections>
      </Container>
    </Page>
  );
}
