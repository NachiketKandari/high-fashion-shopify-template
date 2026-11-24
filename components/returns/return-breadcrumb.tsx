import { Link } from "@/components/ui/link";

interface ReturnBreadcrumbProps {
  orderId: string;
}

export function ReturnBreadcrumb({ orderId }: ReturnBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="type-body-sm flex flex-wrap items-center gap-1 text-ink-muted"
    >
      <Link
        className="focus-ring inline-flex min-h-9 items-center hover:text-ink hover:underline"
        href={`/account/orders/${encodeURIComponent(orderId)}`}
      >
        Tracking &amp; Returns
      </Link>
      <span aria-hidden="true">/</span>
      <span>Exchange &amp; Return</span>
    </nav>
  );
}
