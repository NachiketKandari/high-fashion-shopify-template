import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const CHAPTERS = [
  {
    id: "chapter-x",
    images: Array.from({ length: 11 }, (_, index) => ({
      alt: `Chapter X look ${index + 1}`,
      src: `/reference/clone/lookbook-${String(index + 1).padStart(2, "0")}.jpg`,
    })),
    label: "Chapter X",
  },
  {
    id: "chapter-ix",
    images: single("/reference/clone/archive-vi.jpg", "Chapter IX"),
    label: "Chapter IX",
  },
  {
    id: "chapter-viii",
    images: single("/reference/clone/archive-v.jpg", "Chapter VIII"),
    label: "Chapter VIII",
  },
  {
    id: "chapter-vii",
    images: single("/reference/clone/archive-iv.jpg", "Chapter VII"),
    label: "Chapter VII",
  },
  {
    id: "chapter-vi",
    images: single("/reference/clone/archive-vi.jpg", "Chapter VI"),
    label: "Chapter VI",
  },
  {
    id: "chapter-v",
    images: single("/reference/clone/archive-v.jpg", "Chapter V"),
    label: "Chapter V",
  },
  {
    id: "chapter-iv",
    images: single("/reference/clone/archive-iv.jpg", "Chapter IV"),
    label: "Chapter IV",
  },
  {
    id: "chapter-iii",
    images: single("/reference/clone/archive-iii.jpg", "Chapter III"),
    label: "Chapter III",
  },
  {
    id: "chapter-ii",
    images: single("/reference/clone/archive-ii.jpg", "Chapter II"),
    label: "Chapter II",
  },
  {
    id: "chapter-i",
    images: single("/reference/clone/archive-ii.jpg", "Chapter I"),
    label: "Chapter I",
  },
];

function single(src: string, alt: string) {
  return [{ alt, src }];
}

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/lookbooks" }),
  description: "Polite Society lookbooks, chapter by chapter.",
  openGraph: buildOpenGraph({
    description: "Polite Society lookbooks, chapter by chapter.",
    title: "Lookbooks",
    type: "website",
    url: "/pages/lookbooks",
  }),
  title: "Lookbooks",
};

export default function LookbooksPage() {
  return (
    <Page className="pt-8 pb-24">
      <Container>
        <h1 className="text-lg uppercase leading-[23px] tracking-wider">Lookbooks</h1>

        <nav aria-label="Lookbook chapters" className="mt-5 border-y border-rule">
          <ul
            className="flex gap-6 overflow-x-auto py-4 text-2xs uppercase tracking-wider [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
          >
            {CHAPTERS.map((chapter) => (
              <li className="shrink-0" key={chapter.id}>
                <Link className="transition-opacity hover:opacity-60" href={`#${chapter.id}`}>
                  {chapter.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-16 pt-10">
          {CHAPTERS.map((chapter) => (
            <section className="grid scroll-mt-24 gap-4" id={chapter.id} key={chapter.id}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xs uppercase tracking-wider">{chapter.label}</h2>
                {chapter.id === "chapter-x" ? (
                  <Link
                    className="text-2xs uppercase tracking-wider underline underline-offset-4 transition-opacity hover:opacity-60"
                    href="/collections/chapter-x"
                  >
                    Shop the chapter
                  </Link>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-[3px] md:grid-cols-3">
                {chapter.images.map((image, index) => (
                  <div
                    className="relative aspect-[3/4] overflow-hidden bg-surface"
                    key={`${chapter.id}-${index}`}
                  >
                    <Image
                      alt={image.alt}
                      className="object-cover"
                      fill
                      sizes="100vw"
                      src={image.src}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </Page>
  );
}
