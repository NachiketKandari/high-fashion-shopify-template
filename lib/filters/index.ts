import { isFilterInputActive, type ProductFilter } from "@shopify/hydrogen";

import { shopConfig } from "@/lib/config";
import type { ActiveFilterBadge, Filter } from "@/lib/filters/types";
import { formatPrice } from "@/lib/money";

export function getActiveFilterBadges(
  filters: Filter[],
  activeFilters: ProductFilter[],
): ActiveFilterBadge[] {
  const badges: ActiveFilterBadge[] = [];

  for (const filter of filters) {
    for (const value of filter.values) {
      if (!isFilterInputActive(activeFilters, value.input)) continue;
      badges.push({
        filterLabel: filter.label,
        label: value.label,
        paramKey: filter.paramKey,
        value: value.value,
      });
    }
  }

  return badges;
}

export function formatPriceRangeLabel(
  min: number | null,
  max: number | null,
  currencyCode: string | undefined,
): string {
  const format = (value: number) =>
    currencyCode
      ? formatPrice({ amount: String(value), currencyCode })
      : new Intl.NumberFormat(shopConfig.localization.locale).format(value);
  if (min !== null && max !== null) return `${format(min)} - ${format(max)}`;
  if (min !== null) return `From ${format(min)}`;
  return `Up to ${format(max ?? 0)}`;
}
