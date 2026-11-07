"use client";

import { X } from "lucide-react";

import { SizeGuide as SizeGuideContent } from "@/components/content/size-guide";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SizeGuide({ category }: { category?: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="type-control focus-ring ml-auto flex h-9 shrink-0 cursor-pointer items-center underline underline-offset-4"
            type="button"
          >
            Size guide
          </button>
        }
      />
      <SheetContent
        className="w-(--drawer-size) max-w-full gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-(--gutter)">
          <SheetTitle className="type-h2">Size guide</SheetTitle>
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
      </SheetContent>
    </Sheet>
  );
}
