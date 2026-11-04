"use client";

import { X } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ROWS = [
  { bust: "32", hip: "35", size: "XS", waist: "25" },
  { bust: "34", hip: "37", size: "S", waist: "27" },
  { bust: "36", hip: "39", size: "M", waist: "29" },
  { bust: "38", hip: "41", size: "L", waist: "31" },
  { bust: "40", hip: "43", size: "XL", waist: "33" },
  { bust: "42", hip: "45", size: "XXL", waist: "35" },
];

export function SizeGuide() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="-my-2 ml-auto shrink-0 cursor-pointer py-2 text-2xs uppercase leading-4 tracking-wider underline underline-offset-4"
            type="button"
          >
            Size guide
          </button>
        }
      />
      <SheetContent
        className="w-full max-w-[720px] gap-0 border-l border-rule p-0"
        closeButton={false}
        side="right"
      >
        <div className="flex h-18 shrink-0 items-center justify-between px-5">
          <SheetTitle className="text-xs uppercase tracking-wider">Size guide</SheetTitle>
          <SheetClose
            aria-label="Close size guide"
            className="flex size-9 items-center justify-center"
            type="button"
          >
            <X className="size-4" strokeWidth={1.25} />
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10">
          <h3 className="text-2xl uppercase leading-8 tracking-wider">Tops — Size Guide</h3>
          <p className="mt-3 max-w-[46ch] text-xs leading-[19px] text-muted-foreground">
            Measure around the fullest part of the bust, the natural waist and the fullest part of
            the hip. All measurements are in inches.
          </p>
          <table className="mt-8 w-full border-collapse text-left text-xs uppercase tracking-wider">
            <thead>
              <tr className="border-b border-foreground">
                <th className="py-2 font-normal">Size</th>
                <th className="py-2 font-normal">Bust</th>
                <th className="py-2 font-normal">Waist</th>
                <th className="py-2 font-normal">Hip</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr className="border-b border-rule" key={row.size}>
                  <td className="py-2.5">{row.size}</td>
                  <td className="py-2.5">{row.bust}</td>
                  <td className="py-2.5">{row.waist}</td>
                  <td className="py-2.5">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
