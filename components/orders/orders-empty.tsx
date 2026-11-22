import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

export function OrdersEmpty() {
  return (
    <div className="grid gap-6">
      <p className="type-body-sm text-ink-muted">
        Your orders will appear here after your first purchase.
      </p>
      <div className="grid gap-4 border border-ink-strong p-6">
        <h2 className="type-h4 text-ink-strong">Your wardrobe story starts here</h2>
        <p className="type-body-sm text-ink-muted">
          You haven’t placed an order with this account yet.
        </p>
        <p className="type-body-sm text-ink-strong">
          Explore the collection and find your first piece.
        </p>
        <Button
          className="h-12 w-full bg-ink-strong hover:bg-ink-strong/80"
          render={<Link href="/collections/all" />}
        >
          Discover the Collection
        </Button>
        <p className="type-body-sm text-ink-strong">
          Placed an order as a guest?{" "}
          <Link className="underline underline-offset-4 hover:opacity-60" href="/track">
            Track an order
          </Link>
        </p>
      </div>
      <p className="type-body-sm text-ink-muted">
        Need help finding an order?{" "}
        <Link
          className="text-ink-strong underline underline-offset-4 hover:opacity-60"
          href="/pages/contact-us"
        >
          Contact us
        </Link>
      </p>
    </div>
  );
}
