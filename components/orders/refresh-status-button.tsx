"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function RefreshStatusButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="h-12 w-full border-ink-strong text-ink-strong"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
      variant="outline"
    >
      {isPending ? "Refreshing…" : "Refresh Status"}
    </Button>
  );
}
