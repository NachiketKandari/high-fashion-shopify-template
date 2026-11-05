"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-60 bg-black/30 transition-opacity duration-(--motion-base) ease-(--ease-standard) data-starting-style:opacity-0 data-ending-style:opacity-0 data-[dim=false]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  closeButton = true,
  keepMounted = false,
  overlay = true,
  side = "right",
  ...props
}: SheetPrimitive.Popup.Props & {
  closeButton?: boolean;
  keepMounted?: boolean;
  overlay?: boolean;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal keepMounted={keepMounted}>
      {/* Base UI's own modal backdrop has no z-index, so z-indexed page chrome such as the sticky header stays clickable; without a dimmed overlay, this transparent one takes the click-away. */}
      <SheetOverlay data-dim={overlay} />
      <SheetPrimitive.Popup
        aria-modal={overlay ? "true" : undefined}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "bg-paper fixed z-60 flex flex-col gap-5 shadow-modal transition duration-(--motion-base) ease-(--ease-standard)",
          side === "right" &&
            "inset-y-0 right-0 h-full w-(--drawer-search) max-w-full border-l data-starting-style:translate-x-full data-ending-style:translate-x-full",
          side === "left" &&
            "inset-y-0 left-0 h-full w-(--drawer-search) max-w-full border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-starting-style:translate-y-full data-ending-style:translate-y-full",
          className,
        )}
        {...props}
      >
        {children}
        {closeButton && (
          <SheetPrimitive.Close className="focus-ring absolute top-2 right-2 flex size-9 items-center justify-center transition-opacity hover:opacity-60 disabled:pointer-events-none">
            <XIcon className="size-4" strokeWidth={1.25} />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("type-h3 text-ink", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("type-body-sm text-ink-muted", className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger };
