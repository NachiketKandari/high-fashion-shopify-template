import { Skeleton } from "@/components/ui/skeleton";

export function TrackingSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-[1440px] flex-col desktop:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-8 px-6 pt-6 pb-8 desktop:px-10 desktop:py-10">
        <div className="grid gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-4 h-6 w-64" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <div className="grid gap-3 desktop:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-20 w-full rounded-none" key={index} />
          ))}
        </div>
        <Skeleton className="h-52 w-full rounded-none" />
        <Skeleton className="h-28 w-72 rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
      <aside className="flex flex-col gap-10 px-6 pb-6 desktop:w-[592px] desktop:shrink-0 desktop:border-l desktop:border-ink-strong desktop:px-20 desktop:py-10">
        <Skeleton className="h-48 w-full rounded-none" />
        <Skeleton className="h-32 w-full rounded-none" />
      </aside>
    </div>
  );
}
