import { Wordmark } from "@/components/brand/wordmark";

export function NavFallback() {
  return (
    <>
      <header className="sticky top-0 z-(--z-header) h-(--header-bar-h)">
        <div className="bg-paper">
          <div className="border-y border-rule">
            <div className="flex h-(--header-bar-h) items-center px-(--gutter)">
              <Wordmark priority variant="nav" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
