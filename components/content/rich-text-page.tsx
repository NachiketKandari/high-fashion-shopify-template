import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Prose } from "@/components/ui/prose";
import { Skeleton } from "@/components/ui/skeleton";

interface RichTextPageProps {
  body: string;
  title: string;
}

export function RichTextPage({ body, title }: RichTextPageProps) {
  return (
    <Page>
      <Container className="max-w-2xl">
        <div className="grid gap-10">
          <header className="grid gap-3 border-b border-rule pb-6">
            <h1 className="type-display">{title}</h1>
          </header>
          <Prose>
            <div
              // oxlint-disable-next-line react/no-danger -- Page and policy bodies pass through sanitizeShopifyHtml when fetched.
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </Prose>
        </div>
      </Container>
    </Page>
  );
}

export function RichTextPageSkeleton() {
  return (
    <Page aria-busy="true">
      <Container className="max-w-2xl">
        <div className="grid gap-5">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid gap-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Container>
    </Page>
  );
}
