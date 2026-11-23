import { cn } from "cn";

import type { TrackingStep } from "@/lib/orders/types";

export function TrackingStepper({ steps }: { steps: TrackingStep[] }) {
  return (
    <ol aria-label="Order progress" className="grid gap-3 desktop:grid-cols-4 desktop:gap-4">
      {steps.map((step, index) => {
        const isCurrent = step.state === "current";
        return (
          <li
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-start gap-3 desktop:block"
            key={step.label}
          >
            <div className="flex items-center gap-3 desktop:w-full">
              <span
                className={cn(
                  "type-body-sm flex size-8 shrink-0 items-center justify-center rounded-full border border-ink-strong",
                  step.state === "complete"
                    ? "bg-ink-strong text-inverse"
                    : "bg-paper text-ink-strong",
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-px flex-1 desktop:block",
                    step.state === "complete" ? "bg-ink-strong" : "bg-rule",
                  )}
                />
              ) : null}
            </div>
            <div className="grid gap-1 desktop:mt-3">
              <p
                className={cn(
                  "type-body-sm",
                  step.state === "upcoming" ? "text-ink-muted" : "text-ink-strong",
                )}
              >
                {step.label}
              </p>
              <p className="type-body-sm text-ink-muted">{step.sublabel}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
