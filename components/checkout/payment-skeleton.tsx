import { Skeleton } from "@/components/ui/skeleton";

export function PaymentSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10 desktop:flex-row desktop:gap-0 desktop:py-0"
    >
      <div className="contents desktop:flex desktop:max-w-[800px] desktop:min-w-0 desktop:flex-1 desktop:flex-col desktop:gap-10 desktop:py-6 desktop:pr-10 desktop:pl-6">
        <div className="order-2 grid gap-8 desktop:order-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-[220px] w-full max-w-[453px]" />
        </div>
      </div>

      <aside className="contents desktop:flex desktop:w-[592px] desktop:shrink-0 desktop:flex-col desktop:gap-10 desktop:border-l desktop:border-ink desktop:px-20 desktop:pt-1.5 desktop:pb-35">
        <Skeleton className="order-1 h-[49px] w-full" />
        <div className="order-3 grid gap-8 desktop:order-2">
          <div className="grid gap-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="order-4 h-12 w-full desktop:order-3" />
      </aside>
    </div>
  );
}
