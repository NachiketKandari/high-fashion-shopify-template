import { Skeleton } from "@/components/ui/skeleton";

export function ConfirmationSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10 desktop:grid desktop:grid-cols-[minmax(0,1fr)_592px] desktop:gap-0 desktop:p-0"
    >
      <div className="grid gap-8 border-ink-strong desktop:border desktop:p-10">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-full max-w-[480px]" />
        <div className="grid grid-cols-2 gap-6 desktop:flex desktop:gap-20">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex flex-col gap-4 tablet:flex-row">
          <Skeleton className="h-11 w-full tablet:w-44" />
          <Skeleton className="h-11 w-full tablet:w-56" />
        </div>
      </div>

      <div className="grid gap-8 px-0 desktop:border desktop:border-l-0 desktop:border-ink-strong desktop:px-20 desktop:py-10">
        <div className="flex gap-6">
          <Skeleton className="h-[191px] w-[123px]" />
          <div className="grid flex-1 content-start gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
