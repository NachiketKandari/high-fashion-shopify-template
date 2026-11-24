import { isSizeOption } from "@/lib/product/sizes";
import type { SelectedOption } from "@/lib/product/types";

export function getWishlistColorLabel(selectedOptions: SelectedOption[]): string | undefined {
  const color = selectedOptions.find(({ name }) => /colou?r/i.test(name));
  return color?.value ?? selectedOptions.find(({ name }) => !isSizeOption(name))?.value;
}
