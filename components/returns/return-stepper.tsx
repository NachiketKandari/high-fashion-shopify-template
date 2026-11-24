import { cn } from "cn";

const RETURN_STEPS = ["Items", "Resolution", "Details", "Pickup"] as const;

interface ReturnStepperProps {
  current: 1 | 2 | 3 | 4;
}

export function ReturnStepper({ current }: ReturnStepperProps) {
  return (
    <ol aria-label="Return progress" className="grid grid-cols-4 gap-3">
      {RETURN_STEPS.map((label, index) => {
        const step = index + 1;
        const isCurrent = step === current;
        const isReached = step <= current;
        return (
          <li
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 flex-col gap-2"
            key={label}
          >
            <span
              aria-hidden="true"
              className={cn(
                "type-body-sm flex size-8 items-center justify-center rounded-full border border-ink tabular-nums",
                isReached ? "bg-ink text-inverse" : "bg-paper text-ink",
              )}
            >
              {step}
            </span>
            <span
              className={cn("type-body-sm truncate", isCurrent ? "text-ink" : "text-ink-muted")}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
