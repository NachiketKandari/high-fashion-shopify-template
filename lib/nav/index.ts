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

// Seeded Shopify collections: corsets, dresses-and-jumpsuits, tops, bottoms, new-in, core, essentials, signature.
export const MAIN_NAV: NavItem[] = [
  { href: "/collections/new-in", label: "New In" },
  {
    href: "/collections/new-in",
    label: "Woman",
    columns: [
      {
        title: "Shop Woman",
        links: [
          { href: "/collections/new-in", label: "All" },
          { href: "/collections/tops", label: "Tops" },
          { href: "/collections/corsets", label: "Corsets" },
          { href: "/collections/dresses-and-jumpsuits", label: "Dresses & Jumpsuits" },
          { href: "/collections/new-in", label: "Co-ord Sets" },
          { href: "/collections/tops", label: "Knitwear" },
          { href: "/collections/bottoms", label: "Bottoms" },
          { href: "/collections/new-in", label: "Accessories" },
        ],
      },
      {
        title: "Shop by Occasion",
        links: [
          { href: "/collections/new-in", label: "Work Wear" },
          { href: "/collections/signature", label: "Evening" },
          { href: "/collections/essentials", label: "Weekend" },
          { href: "/collections/signature", label: "Festive" },
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
    href: "/collections/new-in",
    label: "Unisex",
    columns: [
      {
        title: "Shop Unisex",
        links: [
          { href: "/collections/new-in", label: "All" },
          { href: "/collections/tops", label: "Shirts & T-shirts" },
          { href: "/collections/bottoms", label: "Bottoms" },
          { href: "/collections/new-in", label: "Outerwear" },
          { href: "/collections/new-in", label: "Accessories" },
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
      { href: "/collections/core", image: "/reference/editorial-core.jpg", label: "Core" },
      {
        href: "/collections/signature",
        image: "/reference/editorial-elevated.jpg",
        label: "Elevated",
      },
    ],
  },
  {
    href: "/collections/new-in",
    label: "Edit",
    columns: [
      {
        title: "The Edit",
        links: [
          { href: "/collections/new-in", label: "New Arrivals" },
          { href: "/collections/new-in", label: "Bestsellers" },
          { href: "/collections/new-in", label: "Back in Stock" },
          { href: "/blogs/news", label: "The Lookbook" },
        ],
      },
      {
        title: "Styles",
        links: [
          { href: "/collections/core", label: "Everyday" },
          { href: "/collections/signature", label: "Occasion" },
          { href: "/collections/essentials", label: "Layering" },
        ],
      },
    ],
    tiles: [
      { href: "/blogs/news", image: "/reference/tile-journal.jpg", label: "Journal" },
      {
        href: "/pages/contact",
        image: "/reference/tile-careguide.jpg",
        label: "Polite Careguide",
      },
    ],
  },
  { href: "/blogs/news", label: "Our World" },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Help",
    links: [
      { href: "/pages/contact", label: "Size Guide" },
      { href: "/pages/contact", label: "Care Instructions" },
      { href: "/pages/contact", label: "FAQ" },
      { href: "/pages/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/policies/terms-of-service", label: "Terms & Conditions" },
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/shipping-policy", label: "Shipping" },
      { href: "/policies/refund-policy", label: "Returns & Exchange" },
    ],
  },
  {
    title: "The Brand",
    links: [
      { href: "/blogs/news", label: "Our World" },
      { href: "/blogs/news", label: "Journal" },
      { href: "/pages/contact", label: "Press" },
    ],
  },
  {
    title: "Socials",
    links: [
      { href: "https://instagram.com", label: "Instagram" },
      { href: "https://facebook.com", label: "Facebook" },
      { href: "https://pinterest.com", label: "Pinterest" },
    ],
  },
];
