import type { ReactNode } from "react";

import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";

interface SupportCrumb {
  href?: string;
  label: string;
}

interface SupportPageProps {
  aside: ReactNode;
  breadcrumb: SupportCrumb[];
  children: ReactNode;
  intro?: string;
  title: string;
}

function SupportBreadcrumb({ items }: { items: SupportCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="type-body-sm flex flex-wrap items-center gap-x-2 text-ink-muted">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link
                className="focus-ring inline-flex min-h-9 items-center transition-colors hover:text-ink"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="inline-flex min-h-9 items-center text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SupportPage({ aside, breadcrumb, children, intro, title }: SupportPageProps) {
  return (
    <Page className="desktop:pt-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid desktop:grid-cols-[minmax(0,1fr)_32rem] wide:grid-cols-[minmax(0,1fr)_37rem]">
          <div className="min-w-0 px-(--gutter) desktop:pr-10 desktop:pb-10 desktop:pl-10">
            <div className="grid max-w-3xl gap-6">
              <header className="grid gap-6">
                <SupportBreadcrumb items={breadcrumb} />
                <div className="grid gap-6">
                  <h1 className="type-display text-balance">{title}</h1>
                  {intro ? <p className="type-body text-ink-muted">{intro}</p> : null}
                </div>
              </header>
              {children}
            </div>
          </div>
          <aside className="mt-12 min-w-0 px-(--gutter) pb-6 desktop:mt-0 desktop:border-l desktop:border-rule desktop:pb-10 desktop:pr-10 desktop:pl-10">
            <div className="grid max-w-lg gap-6">{aside}</div>
          </aside>
        </div>
      </div>
    </Page>
  );
}
