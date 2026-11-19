import { Skeleton } from "@/components/ui/skeleton";

export function CollectionFiltersSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-5">
      {[0, 1, 2].map((section) => (
        <div key={section} className="grid gap-2.5">
          <Skeleton className="h-5 w-24" />
          {[0, 1, 2, 3].map((option) => (
            <Skeleton className="h-4 w-full" key={option} />
          ))}
        </div>
      ))}
    </div>
  );
}
