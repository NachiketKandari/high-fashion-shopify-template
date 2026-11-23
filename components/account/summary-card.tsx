import { Link } from "@/components/ui/link";

import { AccountCard } from "./card";

interface SummaryCardProps {
  action: string;
  href: string;
  label: string;
  value: string;
}

export function SummaryCard({ action, href, label, value }: SummaryCardProps) {
  return (
    <AccountCard className="grid content-start gap-4">
      <p className="type-h4 text-ink">{label}</p>
      <p className="type-h2 text-ink">{value}</p>
      <Link
        className="type-body-sm focus-ring w-fit text-ink underline-offset-4 hover:underline"
        href={href}
      >
        {action}
      </Link>
    </AccountCard>
  );
}
