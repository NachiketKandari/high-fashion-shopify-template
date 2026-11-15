import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface AccordionItem {
  content: ReactNode;
  id: string;
  label: ReactNode;
}

interface AccordionProps {
  className?: string;
  items: AccordionItem[];
}

export function Accordion({ className, items }: AccordionProps) {
  return (
    <div className={cn("border-b border-rule", className)} data-slot="accordion">
      {items.map((item) => (
        <details className="group border-t border-rule" data-slot="accordion-item" key={item.id}>
          <summary className="type-h4 flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span>{item.label}</span>
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-(--motion-base) ease-(--ease-standard) group-open:rotate-180 motion-reduce:transform-none"
              strokeWidth={1.25}
            />
          </summary>
          <div className="pb-5" data-slot="accordion-content">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
