import type { Metadata } from "next";

import { TrackOrderForm } from "@/components/orders/track-order-form";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: true },
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pt-10 desktop:pt-15">
      <div className="mx-auto w-full max-w-[560px] desktop:border desktop:border-ink-strong desktop:p-8">
        <TrackOrderForm />
      </div>
    </div>
  );
}
