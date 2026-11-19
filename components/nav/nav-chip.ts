export const NAV_CHIP_CLASS =
  "type-nav focus-ring flex h-[43px] shrink-0 cursor-pointer items-center border border-ink px-2.5 text-ink uppercase transition-colors hover:bg-ink hover:text-inverse desktop:h-9 desktop:min-w-9 desktop:justify-center desktop:border-0 desktop:px-0 desktop:hover:bg-transparent desktop:hover:text-ink-muted";

export const NAV_ITEM_CLASS =
  "type-nav focus-ring flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center text-ink uppercase transition-colors hover:text-ink-muted";

export function navLabel(label: string) {
  return label === "Men" ? "Man" : label;
}
