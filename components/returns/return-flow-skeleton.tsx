import { Skeleton } from "@/components/ui/skeleton";

import { ReturnShell } from "./return-shell";

interface ReturnFlowSkeletonProps {
  step?: 1 | 2 | 3 | 4;
}

export function ReturnFlowSkeleton({ step = 1 }: ReturnFlowSkeletonProps) {
  return (
    <ReturnShell
      summary={
        <div className="grid gap-6" aria-busy="true">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-px w-full rounded-none" />
          <Skeleton className="h-3.5 w-48" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-px w-full rounded-none" />
          <div className="grid gap-4">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      }
    >
      <div aria-busy="true" className="grid gap-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="grid gap-2" key={index}>
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
        {step === 1 ? (
          <div className="grid gap-6">
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        ) : (
          <div className="grid gap-4">
            <Skeleton className="h-28 w-full rounded-none" />
            <Skeleton className="h-28 w-full rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
        )}
        <Skeleton className="h-4 w-32" />
      </div>
    </ReturnShell>
  );
}
