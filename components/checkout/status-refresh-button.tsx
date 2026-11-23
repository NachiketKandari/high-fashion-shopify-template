"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function StatusRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      aria-busy={isPending || undefined}
      className="h-10.5 w-full bg-ink-strong hover:bg-ink-strong/80 tablet:w-auto"
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
      Check payment status
    </Button>
  );
}
