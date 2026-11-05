"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import type { Image as ImageType } from "@/lib/media/types";

const LightboxContext = createContext<((image: ImageType) => void) | null>(null);

export function Lightbox({ label, children }: { label: string; children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<ImageType | null>(null);
  const close = useCallback(() => setActiveImage(null), []);

  return (
    <LightboxContext.Provider value={setActiveImage}>
      {children}

      <DialogPrimitive.Root open={activeImage !== null} onOpenChange={(open) => !open && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-60 flex items-center justify-center p-10 outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0"
            aria-describedby={undefined}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <DialogPrimitive.Title className="sr-only">{`${label} enlarged`}</DialogPrimitive.Title>

            <DialogPrimitive.Close className="focus-ring pointer-events-auto absolute top-4 right-4 z-10 flex size-9 items-center justify-center border border-rule bg-paper text-ink transition-opacity hover:opacity-60">
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {activeImage && (
              <div
                className="pointer-events-none relative h-full max-w-full bg-background"
                style={{ aspectRatio: `${activeImage.width} / ${activeImage.height}` }}
              >
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText || `${label} enlarged`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  fetchPriority="high"
                  loading="eager"
                />
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </LightboxContext.Provider>
  );
}

export function LightboxTrigger({ image, children }: { image: ImageType; children: ReactNode }) {
  const open = useContext(LightboxContext);
  return (
    <button
      type="button"
      onClick={() => open?.(image)}
      className="relative h-full w-full cursor-zoom-in"
    >
      {children}
    </button>
  );
}
