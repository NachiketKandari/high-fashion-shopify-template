"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ReturnContext, ReturnEstimate, ReturnableItem } from "@/lib/returns/types";

interface ReturnResolutionFormProps {
  context: ReturnContext;
  estimate: ReturnEstimate | null;
  item: ReturnableItem;
}

export function ReturnResolutionForm({ context, estimate, item }: ReturnResolutionFormProps) {
  const router = useRouter();
  const [resolution, setResolution] = useState<"exchange" | "return">("return");
  const encodedOrderId = encodeURIComponent(context.orderId);
  const itemParam = encodeURIComponent(item.id);

  function continueFlow() {
    const path =
      resolution === "exchange"
        ? `/returns/${encodedOrderId}/exchange?item=${itemParam}`
        : `/returns/${encodedOrderId}/details?item=${itemParam}&resolution=return`;
    router.push(path);
  }

  return (
    <>
      <fieldset className="grid gap-6">
        <legend className="sr-only">Choose exchange or return</legend>
        {[
          {
            description: "Keep the same style. Available replacements appear in the next step.",
            id: "exchange" as const,
            title: "Exchange for another size / color",
          },
          {
            description: "Send this item back and choose an eligible settlement method.",
            id: "return" as const,
            title: "Return item",
          },
        ].map((option) => {
          const selected = resolution === option.id;
          return (
            <label
              className="grid cursor-pointer gap-3 border border-ink p-5 transition-colors duration-(--motion-fast) focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink hover:bg-surface/40"
              key={option.id}
            >
              <input
                checked={selected}
                className="sr-only"
                name="return-resolution"
                onChange={() => setResolution(option.id)}
                type="radio"
                value={option.id}
              />
              <span className="type-body text-ink">
                {option.title}
                {selected ? " — Selected" : ""}
              </span>
              <span className="type-body-sm text-ink-muted">{option.description}</span>
              <span className="type-body-sm text-ink">
                {selected ? "Selected" : `Select ${option.id}`}
              </span>
            </label>
          );
        })}
      </fieldset>

      <Button className="w-full" onClick={continueFlow} size="lg">
        {resolution === "exchange" ? "Continue with exchange" : "Continue with return"}
      </Button>

      <Link
        className="type-body-sm focus-ring inline-flex min-h-9 w-fit items-center text-ink hover:underline"
        href={`/returns/${encodedOrderId}`}
      >
        Back to item selection
      </Link>
    </>
  );
}
