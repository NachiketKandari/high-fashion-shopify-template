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

// Links point at the live catalog until the Shopify catalog is seeded with the reference collections.
export const MAIN_NAV: NavItem[] = [
  { href: "/collections/all", label: "New In" },
  {
    href: "/collections/all",
    label: "Woman",
    columns: [
      {
        title: "Shop Woman",
        links: [
          { href: "/collections/all", label: "All" },
          { href: "/collections/all", label: "Tops" },
          { href: "/collections/all", label: "Corsets" },
          { href: "/collections/all", label: "Dresses & Jumpsuits" },
          { href: "/collections/all", label: "Co-ord Sets" },
          { href: "/collections/all", label: "Knitwear" },
          { href: "/collections/all", label: "Bottoms" },
          { href: "/collections/all", label: "Accessories" },
        ],
      },
      {
        title: "Shop by Occasion",
        links: [
          { href: "/collections/all", label: "Work Wear" },
          { href: "/collections/all", label: "Evening" },
          { href: "/collections/all", label: "Weekend" },
          { href: "/collections/all", label: "Festive" },
        ],
      },
      {
        title: "Shop by Category",
        links: [
          { href: "/collections/all", label: "Core" },
          { href: "/collections/all", label: "Essentials" },
          { href: "/collections/all", label: "Elevated" },
        ],
      },
    ],
    tiles: [
      { href: "/collections/all", image: "/reference/editorial-corsets.jpg", label: "Corsets" },
      {
        href: "/collections/all",
        image: "/reference/editorial-dresses.jpg",
        label: "Dresses & Jumpsuits",
      },
    ],
  },
  {
    href: "/collections/all",
    label: "Unisex",
    columns: [
      {
        title: "Shop Unisex",
        links: [
          { href: "/collections/all", label: "All" },
          { href: "/collections/all", label: "Shirts & T-shirts" },
          { href: "/collections/all", label: "Bottoms" },
          { href: "/collections/all", label: "Outerwear" },
          { href: "/collections/all", label: "Accessories" },
        ],
      },
      {
        title: "Shop by Category",
        links: [
          { href: "/collections/all", label: "Core" },
          { href: "/collections/all", label: "Essentials" },
          { href: "/collections/all", label: "Elevated" },
        ],
      },
    ],
    tiles: [
      { href: "/collections/all", image: "/reference/editorial-core.jpg", label: "Core" },
      {
        href: "/collections/all",
        image: "/reference/editorial-elevated.jpg",
        label: "Elevated",
      },
    ],
  },
  {
    href: "/collections/all",
    label: "Edit",
    columns: [
      {
        title: "The Edit",
        links: [
          { href: "/collections/all", label: "New Arrivals" },
          { href: "/collections/all", label: "Bestsellers" },
          { href: "/collections/all", label: "Back in Stock" },
          { href: "/collections/all", label: "The Lookbook" },
        ],
      },
      {
        title: "Styles",
        links: [
          { href: "/collections/all", label: "Everyday" },
          { href: "/collections/all", label: "Occasion" },
          { href: "/collections/all", label: "Layering" },
        ],
      },
    ],
    tiles: [
      { href: "/collections/all", image: "/reference/tile-journal.jpg", label: "Journal" },
      {
        href: "/collections/all",
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
