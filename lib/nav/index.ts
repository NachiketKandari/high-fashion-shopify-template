export interface NavLink {
  href: string;
  label: string;
}

export interface NavColumn {
  links: NavLink[];
  title: string;
}

export interface NavTile {
  href: string;
  image: string;
  label: string;
}

export interface NavItem {
  columns?: NavColumn[];
  href: string;
  label: string;
  tiles?: NavTile[];
}

export interface FooterColumn {
  links: NavLink[];
  title: string;
}

// Mirrors the live Polites Society menu. The collection handles are seeded by scripts/seed-catalog.mjs.
export const MAIN_NAV: NavItem[] = [
  { href: "/collections/chapter-x", label: "New In" },
  {
    href: "/collections/women",
    label: "Woman",
    columns: [
      {
        title: "Shop Woman",
        links: [
          { href: "/collections/women", label: "All" },
          { href: "/collections/tops", label: "Tops" },
          { href: "/collections/corsets", label: "Corsets" },
          { href: "/collections/dresses-and-jumpsuits", label: "Dresses & Jumpsuits" },
          { href: "/collections/co-ord-sets", label: "Co-ord Sets" },
          { href: "/collections/knits", label: "Knitwear" },
          { href: "/collections/bottoms-women", label: "Bottoms" },
          { href: "/collections/accessories", label: "Accessories" },
        ],
      },
      {
        title: "Shop by Occasion",
        links: [
          { href: "/collections/work-wear", label: "Work Wear" },
          { href: "/collections/evening", label: "Evening" },
          { href: "/collections/weekend", label: "Weekend" },
          { href: "/collections/festive", label: "Festive" },
        ],
      },
      {
        title: "Shop by Category",
        links: [
          { href: "/collections/core", label: "Core" },
          { href: "/collections/essentials", label: "Essentials" },
          { href: "/collections/signature", label: "Elevated" },
        ],
      },
    ],
    tiles: [
      { href: "/collections/corsets", image: "/reference/editorial-corsets.jpg", label: "Corsets" },
      {
        href: "/collections/dresses-and-jumpsuits",
        image: "/reference/editorial-dresses.jpg",
        label: "Dresses & Jumpsuits",
      },
    ],
  },
  {
    href: "/collections/unisex-1",
    label: "Unisex",
    columns: [
      {
        title: "Shop Unisex",
        links: [
          { href: "/collections/shirts-and-tshirts", label: "Shirts & T-shirts" },
          { href: "/collections/bottoms-unisex", label: "Bottoms" },
          { href: "/collections/outerwear", label: "Outerwear" },
        ],
      },
      {
        title: "Shop by Category",
        links: [
          { href: "/collections/core", label: "Core" },
          { href: "/collections/essentials", label: "Essentials" },
          { href: "/collections/signature", label: "Elevated" },
        ],
      },
    ],
    tiles: [
      {
        href: "/collections/tops",
        image: "/reference/editorial-core.jpg",
        label: "Shirts & T-shirts",
      },
      {
        href: "/collections/bottoms",
        image: "/reference/editorial-elevated.jpg",
        label: "Bottoms",
      },
    ],
  },
  {
    href: "/pages/lookbooks",
    label: "Edit",
    columns: [
      {
        title: "The Edit",
        links: [
          { href: "/pages/lookbooks", label: "Lookbooks" },
          { href: "/blogs/journal-2", label: "Journal" },
        ],
      },
    ],
    tiles: [
      { href: "/pages/lookbooks", image: "/reference/tile-journal.jpg", label: "Lookbooks" },
      { href: "/blogs/journal-2", image: "/reference/tile-our-world.jpg", label: "Journal" },
    ],
  },
  {
    href: "/pages/about-us",
    label: "Our World",
    columns: [
      {
        title: "Our World",
        links: [
          { href: "/pages/about-us", label: "About Us" },
          { href: "/pages/press-v2", label: "Press" },
        ],
      },
    ],
    tiles: [
      {
        href: "/pages/about-us#founder",
        image: "/reference/clone/about-founder.png",
        label: "The Founder",
      },
      {
        href: "/pages/about-us#store",
        image: "/reference/clone/about-store.png",
        label: "Flagship Store",
      },
    ],
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Help",
    links: [
      { href: "/pages/size-guide", label: "Size Guide" },
      { href: "/pages/care-guide", label: "Care Instructions" },
      { href: "/pages/faqs", label: "FAQ" },
      { href: "/pages/contact-us", label: "Contact Us" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/pages/terms-of-service", label: "Terms & Conditions" },
      { href: "/pages/privacy-policies", label: "Privacy" },
      { href: "/pages/shipping-returns", label: "Shipping" },
      { href: "/pages/returns-exchanges", label: "Returns & Exchange" },
    ],
  },
  {
    title: "The Brand",
    links: [
      { href: "/pages/about-us", label: "Our World" },
      { href: "/blogs/journal-2", label: "Journal" },
      { href: "/pages/press-v2", label: "Press" },
    ],
  },
  {
    title: "Socials",
    links: [
      { href: "https://www.instagram.com/politesociety_official/", label: "Instagram" },
      { href: "https://www.facebook.com/politesocietyshop/", label: "Facebook" },
      { href: "https://in.pinterest.com/politesociety_official/", label: "Pinterest" },
    ],
  },
];
