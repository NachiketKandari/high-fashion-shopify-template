import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

import { AccountCard } from "./card";

export function DocumentsList() {
  return (
    <AccountCard className="grid gap-4">
      <h2 className="type-h4 text-ink">No documents are available yet</h2>
      <p className="type-body-sm text-ink-muted">
        Tax invoices and credit notes will appear here when they are issued.
      </p>
      <p className="type-body-sm text-ink-muted">
        A credit note appears only after a return is approved and the credit is issued.
      </p>
      <Button render={<Link href="/account/orders" />} size="lg">
        View My Orders
      </Button>
    </AccountCard>
  );
}
