import type { Metadata } from "next";

import { CollectionCard } from "@/components/collections/collection-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getCollectionsListing } from "@/lib/collections/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Collections";
  const description = "Browse products by collection.";
  return {
    title,
    description,
    alternates: buildAlternates({
      pathname: "/collections",
    }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/collections",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function CollectionsPage() {
  const collections = await getCollectionsListing({});
  const viewCollectionLabel = "View this collection";
  return (
    <Page>
      <Container>
        <Sections>
          <h1 className="type-display">Collections</h1>

          {collections.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-(--grid-gap) gap-y-10 tablet:grid-cols-3 desktop:grid-cols-4">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.handle}
                  collection={collection}
                  viewCollectionLabel={viewCollectionLabel}
                />
              ))}
            </div>
          ) : (
            <p className="type-body text-ink-muted">No collections found.</p>
          )}
        </Sections>
      </Container>
    </Page>
  );
}
