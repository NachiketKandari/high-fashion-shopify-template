import Image from "next/image";

import { Price } from "@/components/product/price";
import { formatReturnDate, formatReturnItemOptions } from "@/lib/returns";
import type { ReturnableItem } from "@/lib/returns/types";

interface ReturnItemCardProps {
  item: ReturnableItem;
  onSelect: (itemId: string) => void;
  selected: boolean;
}

export function ReturnItemCard({ item, onSelect, selected }: ReturnItemCardProps) {
  const options = formatReturnItemOptions(item.options);
  const deliveredAt = formatReturnDate(item.deliveredAt);
  const meta = [options, deliveredAt ? `Delivered ${deliveredAt}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <label className="group relative flex cursor-pointer gap-5 border border-ink p-4 transition-colors duration-(--motion-fast) focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink hover:bg-surface/40">
      <input
        checked={selected}
        className="sr-only"
        name="return-item"
        onChange={() => onSelect(item.id)}
        type="radio"
        value={item.id}
      />
      <span className="relative h-[124px] w-[90px] shrink-0 overflow-hidden bg-surface">
        {item.image ? (
          <Image
            alt={item.image.altText}
            className="object-cover"
            fill
            sizes="100vw"
            src={item.image.url}
          />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="type-control text-ink">{item.title}</span>
        {meta ? <span className="type-body-sm text-ink-muted">{meta}</span> : null}
        {item.totalPrice ? (
          <span className="type-body-sm text-ink">
            <Price amount={item.totalPrice.amount} currencyCode={item.totalPrice.currencyCode} />{" "}
            including tax
          </span>
        ) : null}
        <span className="type-body-sm text-ink">
          {selected ? `Selected for return · Qty ${item.availableQuantity}` : "Select this item"}
        </span>
      </span>
    </label>
  );
}
