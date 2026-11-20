"use client";

import { Info, X } from "lucide-react";

import { SizeGuide as SizeGuideContent } from "@/components/content/size-guide";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SizeGuide({ category }: { category?: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="type-control focus-ring -my-2.5 inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 text-ink-muted hover:text-ink"
            type="button"
          >
            <Info aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
            <span className="underline underline-offset-4">Size guide</span>
          </button>
        }
      />
      <SheetContent
        className="w-(--drawer-size) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-18 shrink-0 items-center justify-between px-6">
          <SheetTitle className="type-h3">Size guide</SheetTitle>
          <SheetClose
            aria-label="Close size guide"
            className="focus-ring flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-(--gutter) pb-10">
          <SizeGuideContent defaultCategory={category} key={category ?? "default"} />
        </div>
        <div className="shrink-0 p-6">
          <SheetClose
            render={<Button className="h-[53px] w-full" variant="outline" />}
            type="button"
          >
            Close
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
