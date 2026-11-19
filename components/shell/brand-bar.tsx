import { Wordmark } from "@/components/brand/wordmark";

export function BrandBar() {
  return (
    <header className="flex h-15 shrink-0 items-center justify-center border-b border-rule bg-paper">
      <Wordmark priority variant="bar" />
    </header>
  );
}
