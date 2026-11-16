import { XIcon } from "lucide-react";

import { Link } from "@/components/ui/link";

interface FilterBadgeProps {
  href?: string;
  label: string;
  onRemove: () => void;
}

export function FilterBadge({ href, label, onRemove }: FilterBadgeProps) {
  const className =
    "type-label focus-ring inline-flex min-h-9 cursor-pointer items-center gap-1 bg-surface px-2.5 text-ink transition-colors hover:bg-rule";
  const content = (
    <>
      {label}
      <XIcon className="size-3" strokeWidth={1.25} />
    </>
  );
  const removeLabel = `Remove filter: ${label}`;
  if (!href) {
    return (
      <button aria-label={removeLabel} className={className} onClick={onRemove} type="button">
        {content}
      </button>
    );
  }
  return (
    <Link
      aria-label={removeLabel}
      className={className}
      href={href}
      scroll={false}
      onClick={(event) => {
        event.preventDefault();
        onRemove();
      }}
    >
      {content}
    </Link>
  );
}
