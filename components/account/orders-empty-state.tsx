import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

import { AccountCard } from "./card";

export function OrdersEmptyState() {
  return (
    <AccountCard className="grid gap-4">
      <h2 className="type-h4 text-ink">Your wardrobe story starts here</h2>
      <p className="type-body-sm text-ink-muted">
        You haven’t placed an order with this account yet.
      </p>
      <p className="type-body-sm text-ink">Explore the collection and find your first piece.</p>
      <Button render={<Link href="/collections/all" />} size="lg">
        Discover the Collection
      </Button>
      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink underline-offset-4 hover:underline"
        href="/pages/contact-us"
      >
        Placed an order as a guest? Contact us to track it
      </Link>
    </AccountCard>
  );
}
