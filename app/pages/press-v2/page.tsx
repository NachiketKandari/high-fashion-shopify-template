import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const PRESS = [
  {
    href: "https://www.grazia.co.in/fashion/make-way-for-tailored-separates-and-handcrafted-leather-bags-6933-1.html",
    image: "/reference/clone/press-grazia.jpg",
    outlet: "Grazia",
    quote:
      "Inspired by a triad of power, integrity, and sex, Jain's work focuses on sharp tailoring and corsetry.",
  },
  {
    href: "https://www.platform-mag.com/fashion/polite-society.html",
    image: "/reference/clone/press-platform.jpg",
    outlet: "Platform",
    quote:
      "I'm going back in time and looking at my own life, I've realised the more personal the designs are, the lesser is the chance of getting lost in the sea of brands all around.",
  },
  {
    href: "https://www.harpersbazaar.in/fashion/story/indias-trailblazing-street-style-designers-on-self-expression-breaking-the-rules-and-redefining-their-brand-ethos-629975-2023-08-14",
    image: "/reference/clone/press-bazaar.jpg",
    outlet: "Harper's Bazaar",
    quote:
      "Instead of relying on androgynous silhouettes, I want to experiment with daring cuts and body-fitted silhouettes while also ensuring that design innovation remains at the forefront of everything we do.",
  },
  {
    href: "https://www.vogue.in/fashion/content/selling-sexy-in-2022",
    image: "/reference/clone/press-vogue.jpg",
    outlet: "Vogue",
    quote:
      "Feeling sexy has a lot to do with how a garment falls on your body — one can be clad up from head-to-toe and still feel empowered because they love how their outfit feels on the body.",
  },
  {
    href: "https://in.fashionnetwork.com/news/Polite-society-launches-first-upcycled-line,1544434.html",
    image: "/reference/clone/press-fashion-network.jpg",
    outlet: "Fashion Network",
    quote:
      "The gender neutral line is named 'Poli-morph', will be evergreen, and is designed to contribute to a circular economy.",
  },
  {
    href: "https://www.vogue.in/vogue-closet/collection/sobhita-dhulipala-polite-society-bodysuit-low-rise-bottoms",
    image: "/reference/clone/press-vogue-sobhita.webp",
    outlet: "Vogue",
    quote:
      "Sobhita Dhulipala is the ultimate fashion girl in her Polite Society bodysuit and low-rise trousers.",
  },
  {
    href: "https://elle.in/coordinated-separates-for-summer/",
    image: "/reference/clone/press-elle.jpg",
    outlet: "Elle",
    quote: "If you're into oversized, genderless fits — this look is tailor-made for you.",
  },
  {
    href: "https://homegrown.co.in/homegrown-supply/polite-societys-provocative-collections-are-shaped-by-sustainability-nonconformity",
    image: "/reference/clone/press-homegrown.jpg",
    outlet: "Homegrown",
    quote: "Polite Society's Provocative Collections Are Shaped By Nonconformity & Culture.",
  },
];

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/press-v2" }),
  description: "Polite Society in the press.",
  openGraph: buildOpenGraph({
    description: "Polite Society in the press.",
    title: "Press",
    type: "website",
    url: "/pages/press-v2",
  }),
  title: "Press",
};

export default function PressPage() {
  return (
    <Page className="pt-8 pb-24">
      <Container>
        <h1 className="text-lg uppercase leading-[23px] tracking-wider">Press</h1>

        <div className="mt-8 grid grid-cols-1 gap-x-[3px] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {PRESS.map((entry) => (
            <a
              className="group grid content-start gap-4"
              href={entry.href}
              key={entry.quote}
              rel="noreferrer"
              target="_blank"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <Image
                  alt={`${entry.outlet} press feature`}
                  className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
                  fill
                  sizes="100vw"
                  src={entry.image}
                />
              </div>
              <div className="grid gap-3">
                <p className="text-sm leading-[21px] font-light tracking-wide text-muted-foreground">
                  &ldquo;{entry.quote}&rdquo;
                </p>
                <p className="text-2xs uppercase tracking-wider underline underline-offset-4">
                  {entry.outlet}
                </p>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </Page>
  );
}
