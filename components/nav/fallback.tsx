import Image from "next/image";

import { Link } from "@/components/ui/link";

import { Announcement } from "./announcement";

export function NavFallback() {
  return (
    <>
      <Announcement />
      <header className="sticky top-0 z-50 h-14 xl:h-[76px]">
        <div className="bg-background">
          <div className="border-y border-rule">
            <div className="flex h-14 items-center px-5 md:px-[30px] xl:h-[76px]">
              <Link aria-label="Polite Society" className="shrink-0" href="/">
                <Image
                  alt="Polite Society"
                  className="h-auto w-[170px] md:w-[250px] xl:w-[342px]"
                  height={28}
                  priority
                  sizes="100vw"
                  src="/reference/ps-wordmark.svg"
                  width={342}
                />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
