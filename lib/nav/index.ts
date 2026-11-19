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

// Mirrors the header in menu-woman (1:152) and menu-man (1:309).
export const MAIN_NAV: NavItem[] = [
  {
    href: "/collections/womenswear",
    label: "Woman",
    columns: [
      {
        title: "Shop Woman",
        links: [
          { href: "/collections/womenswear", label: "All" },
          { href: "/collections/bralettes", label: "Bralettes" },
          { href: "/collections/bodysuits", label: "Bodysuits" },
          { href: "/collections/dresses", label: "Dress" },
          { href: "/collections/bottoms", label: "Pants" },
          { href: "/collections/racer-backs", label: "Racer Backs" },
          { href: "/collections/shirts", label: "Shirts" },
          { href: "/collections/skirts", label: "Skirt" },
          { href: "/collections/shorts", label: "Shorts" },
          { href: "/collections/tshirts", label: "T-shirt" },
          { href: "/collections/tops", label: "Tops" },
        ],
      },
    ],
    tiles: [
      {
        href: "/collections/core",
        image: "/reference/design-i/menu/woman-core.jpg",
        label: "Core",
      },
      {
        href: "/collections/signature",
        image: "/reference/design-i/menu/woman-elevated.jpg",
        label: "Elevated",
      },
      {
        href: "/collections/racer-backs",
        image: "/reference/design-i/menu/woman-racer.jpg",
        label: "Racer",
      },
    ],
  },
  {
    href: "/collections/menswear",
    label: "Man",
    columns: [
      {
        title: "Shop Men",
        links: [
          { href: "/collections/menswear", label: "All" },
          { href: "/collections/jackets", label: "Jackets" },
          { href: "/collections/bottoms-unisex", label: "Pants" },
          { href: "/collections/shirts-and-tshirts", label: "Shirts" },
          { href: "/collections/shorts", label: "Shorts" },
          { href: "/collections/tshirts", label: "T-shirt" },
        ],
      },
    ],
    tiles: [
      {
        href: "/collections/jackets",
        image: "/reference/design-i/menu/man-jacket.jpg",
        label: "Jacket",
      },
      {
        href: "/collections/shirts-and-tshirts",
        image: "/reference/design-i/menu/man-shirt.jpg",
        label: "Shirt",
      },
    ],
  },
];

// Destinations the frame moves out of the bar but the mobile panel still needs.
export const SECONDARY_NAV: NavItem[] = [
  { href: "/collections/new-in", label: "New In" },
  { href: "/pages/lookbooks", label: "Edit" },
  { href: "/pages/about-us", label: "Our World" },
];

// The PLP category row in PLP - 4 Column, Model (2044:1155).
export const COLLECTION_TABS: NavLink[] = [
  { href: "/collections/womenswear", label: "All" },
  { href: "/collections/bottoms", label: "Pants" },
  { href: "/collections/skirts", label: "Skirt" },
  { href: "/collections/shorts", label: "Shorts" },
  { href: "/collections/dresses", label: "Dress" },
  { href: "/collections/bralettes", label: "Bralettes" },
  { href: "/collections/bodysuits", label: "Bodysuits" },
  { href: "/collections/tshirts", label: "T-shirt" },
  { href: "/collections/racer-backs", label: "Racer Backs" },
  { href: "/collections/tops", label: "Tops" },
  { href: "/collections/shirts", label: "Shirts" },
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
      { href: "https://www.instagram.com/", label: "Instagram" },
      { href: "https://www.facebook.com/", label: "Facebook" },
      { href: "https://www.pinterest.com/", label: "Pinterest" },
    ],
  },
];
