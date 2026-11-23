import type { Metadata } from "next";

import { DocumentsList } from "@/components/account/documents-list";
import { AccountPageHeader } from "@/components/account/page-header";

export const metadata: Metadata = {
  title: "Tax invoices & credit notes",
};

export default function InvoicesPage() {
  return (
    <div className="grid gap-6">
      <AccountPageHeader
        breadcrumb="Invoices & notes"
        description="Documents issued for your orders appear here. A credit note appears only after a credit has been approved and issued."
        title="Tax invoices & credit notes"
      />
      <DocumentsList />
    </div>
  );
}
