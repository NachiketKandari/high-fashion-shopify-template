const NAV_UNDERLINE_CLASS =
  "after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--motion-underline) after:ease-(--ease-standard) after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none";

export const NAV_CHIP_CLASS = `type-nav focus-ring relative flex h-[43px] shrink-0 cursor-pointer items-center border border-ink px-2.5 text-ink uppercase transition-colors hover:bg-ink hover:text-inverse desktop:h-9 desktop:min-w-9 desktop:justify-center desktop:border-0 desktop:px-0 desktop:hover:bg-transparent desktop:hover:text-ink ${NAV_UNDERLINE_CLASS}`;

const NAV_ITEM_BASE =
  "type-nav focus-ring relative flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center uppercase transition-colors duration-(--motion-base) ease-(--ease-standard)";

export const NAV_ITEM_CLASS = `${NAV_ITEM_BASE} text-ink ${NAV_UNDERLINE_CLASS} aria-pressed:after:scale-x-100`;

export const NAV_PANEL_ITEM_CLASS = `${NAV_ITEM_BASE} text-ink-muted aria-pressed:text-ink`;

export const NAV_PANEL_LINK_CLASS = `${NAV_ITEM_BASE} text-ink-muted ${NAV_UNDERLINE_CLASS} hover:text-ink focus-visible:text-ink`;

export const NAV_TAB_CLASS = `${NAV_ITEM_BASE} text-ink-muted ${NAV_UNDERLINE_CLASS} aria-pressed:text-ink aria-pressed:after:scale-x-100`;

export function navLabel(label: string) {
  return label === "Men" ? "Man" : label;
}
