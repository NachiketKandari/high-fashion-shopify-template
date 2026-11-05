import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { WishlistContent } from "@/components/wishlist/content";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: {
    follow: false,
    index: false,
  },
};

export default function WishlistPage() {
  return (
    <Page className="pt-6 md:pt-8">
      <Container>
        <div className="grid gap-6">
          <h1 className="text-lg uppercase leading-[23px] tracking-wider">Wishlist</h1>
          <WishlistContent />
        </div>
      </Container>
    </Page>
  );
}
