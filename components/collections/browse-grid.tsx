import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export const BROWSE_GRID_CLASS =
  "grid grid-cols-2 gap-x-0 gap-y-6 pt-4 tablet:grid-cols-3 desktop:grid-cols-4 desktop:gap-y-30 desktop:pt-10 [[data-card-density=gallery]_&]:grid-cols-1 [[data-card-density=gallery]_&]:gap-y-10 tablet:[[data-card-density=gallery]_&]:grid-cols-2 desktop:[[data-card-density=gallery]_&]:mx-auto desktop:[[data-card-density=gallery]_&]:max-w-240 desktop:[[data-card-density=gallery]_&]:grid-cols-2 desktop:[[data-card-density=gallery]_&]:gap-y-20";

export function BrowseProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <ImagePlaceholder className="aspect-[3/4] animate-pulse motion-reduce:animate-none desktop:aspect-[4/5] [[data-card-density=gallery]_&]:aspect-[2/3]" />
      <div className="grid gap-1 px-6 pt-2 desktop:pt-6">
        <div className="h-4 w-2/3 animate-pulse bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-1/3 animate-pulse bg-surface motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function BrowseGridSkeleton({ count }: { count: number }) {
  return (
    <div className={BROWSE_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <BrowseProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
