const p = (...paragraphs) => paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");

const list = (items, ordered = false) => {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`;
};

const image = (src, alt, caption) =>
  `<figure><img alt="${alt}" src="${src}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

const VALUES = [
  ["/reference/clone/about-ethical.png", "Ethical Production"],
  ["/reference/clone/about-individuality.png", "Individuality"],
  ["/reference/clone/about-craftsmanship.png", "Craftsmanship"],
  ["/reference/clone/about-sensuality.png", "Sensuality"],
  ["/reference/clone/about-design-integrity.png", "Design Integrity"],
  ["/reference/clone/about-community.png", "Community"],
];

const ARCHIVE = [
  ["/reference/clone/archive-ii.jpg", "CH II"],
  ["/reference/clone/archive-iii.jpg", "CH III"],
  ["/reference/clone/archive-iv.jpg", "CH IV"],
  ["/reference/clone/archive-v.jpg", "CH V"],
  ["/reference/clone/archive-vi.jpg", "CH VI"],
];

const LOOKBOOKS = [
  {
    id: "chapter-x",
    images: Array.from({ length: 11 }, (_, index) => [
      `/reference/clone/lookbook-${String(index + 1).padStart(2, "0")}.jpg`,
      `Chapter X look ${index + 1}`,
    ]),
    label: "Chapter X",
    shop: true,
  },
  {
    id: "chapter-ix",
    images: [["/reference/clone/archive-vi.jpg", "Chapter IX"]],
    label: "Chapter IX",
  },
  {
    id: "chapter-viii",
    images: [["/reference/clone/archive-v.jpg", "Chapter VIII"]],
    label: "Chapter VIII",
  },
  {
    id: "chapter-vii",
    images: [["/reference/clone/archive-iv.jpg", "Chapter VII"]],
    label: "Chapter VII",
  },
  {
    id: "chapter-vi",
    images: [["/reference/clone/archive-vi.jpg", "Chapter VI"]],
    label: "Chapter VI",
  },
  {
    id: "chapter-v",
    images: [["/reference/clone/archive-v.jpg", "Chapter V"]],
    label: "Chapter V",
  },
  {
    id: "chapter-iv",
    images: [["/reference/clone/archive-iv.jpg", "Chapter IV"]],
    label: "Chapter IV",
  },
  {
    id: "chapter-iii",
    images: [["/reference/clone/archive-iii.jpg", "Chapter III"]],
    label: "Chapter III",
  },
  {
    id: "chapter-ii",
    images: [["/reference/clone/archive-ii.jpg", "Chapter II"]],
    label: "Chapter II",
  },
  {
    id: "chapter-i",
    images: [["/reference/clone/archive-ii.jpg", "Chapter I"]],
    label: "Chapter I",
  },
];

const PRESS = [
  {
    image: "/reference/clone/press-grazia.jpg",
    outlet: "Grazia",
    quote:
      "Sharp tailoring, corsetry and handcrafted leather come together in a wardrobe built on structure and ease.",
  },
  {
    image: "/reference/clone/press-platform.jpg",
    outlet: "Platform",
    quote:
      "The more personal the design, the less likely it is to get lost in the sea of brands all around.",
  },
  {
    image: "/reference/clone/press-bazaar.jpg",
    outlet: "Harper's Bazaar",
    quote:
      "Instead of relying on androgynous silhouettes, the collection experiments with daring cuts and body-fitted silhouettes while keeping design innovation at the forefront.",
  },
  {
    image: "/reference/clone/press-vogue.jpg",
    outlet: "Vogue",
    quote:
      "Feeling sexy has a lot to do with how a garment falls on your body — one can be clad up from head-to-toe and still feel empowered because they love how their outfit feels on the body.",
  },
  {
    image: "/reference/clone/press-fashion-network.jpg",
    outlet: "Fashion Network",
    quote:
      "The gender-neutral line is designed to be evergreen and to contribute to a circular economy.",
  },
  {
    image: "/reference/clone/press-vogue-evening.webp",
    outlet: "Vogue",
    quote: "A bodysuit and low-rise trousers make an easy, confident evening look.",
  },
  {
    image: "/reference/clone/press-elle.jpg",
    outlet: "Elle",
    quote: "If you're into oversized, genderless fits — this look is tailor-made for you.",
  },
  {
    image: "/reference/clone/press-homegrown.jpg",
    outlet: "Homegrown",
    quote: "Provocative collections shaped by nonconformity and culture.",
  },
];

const FAQS = [
  [
    "How do I place an order?",
    "Choose your piece, select a colour and size, and add it to your cart. Checkout is hosted by Shopify, where you can pay by card, UPI or the payment methods available for your region.",
  ],
  [
    "What payment methods do you accept?",
    "We accept major credit and debit cards, UPI, net banking and wallet payments through Shopify checkout. Available methods are shown at checkout for your delivery country.",
  ],
  [
    "Can I change or cancel my order?",
    "Write to hello@loremipsum.example as soon as possible with your order number. We can change or cancel an order before it is processed or shipped.",
  ],
  [
    "When will my order be dispatched?",
    "Standard orders are dispatched within 6–7 business days within India. Made-to-order and made-to-measure pieces take 1–2 weeks. You will receive a tracking link by email when each shipment leaves.",
  ],
  [
    "How can I track my order?",
    "Once your order ships, we email a tracking link. You can also contact us on WhatsApp at +91 90000 00000 with your order number.",
  ],
  [
    "Do you ship internationally?",
    "Yes. International shipping is approximately $30 (INR 2,500), excluding duties and taxes. Orders are dispatched within 7–10 business days.",
  ],
  [
    "What is your return and exchange policy?",
    "Domestic returns and exchanges can be requested within 14 days of delivery. Approved domestic returns are issued as store credit; international orders are not eligible for refunds or direct exchanges except for wrong, damaged or faulty items.",
  ],
  [
    "How do I make a return or exchange?",
    "Use the contact page or email hello@loremipsum.example with your order number and the item you want to return. Wait for approval before sending anything back.",
  ],
  [
    "When will I receive my refund?",
    "Approved refunds are processed within 8–10 business days after we receive and inspect the item. Domestic returns are normally issued as store credit valid for six months.",
  ],
  [
    "My order arrived faulty or incorrect. What should I do?",
    "Email hello@loremipsum.example within 24 hours of delivery with your order number, photos of the item and photos of the packaging. Do not wear, wash or alter the item before contacting us.",
  ],
  [
    "How do I find my size?",
    "Compare your measurements with the size guide. If you are between sizes, write to us before ordering and we will help you choose.",
  ],
  [
    "How should I care for my pieces?",
    "Follow the care label on each garment. The care guide covers corsets and other pieces, including dry cleaning, washing and ironing instructions.",
  ],
  [
    "Will a sold-out piece be restocked?",
    "Restocks depend on the fabric and production schedule. Follow us on Instagram or join the newsletter for restock announcements.",
  ],
  [
    "Where can I visit you?",
    "Visit us at 123 Example Street, Mumbai, India. We are open daily, 11am – 8pm.",
  ],
  [
    "How do I contact customer care?",
    "Call or WhatsApp +91 90000 00000, email hello@loremipsum.example, or use the contact form. We reply within one working day.",
  ],
];

const CARE = [
  {
    items: [
      "Dry clean only",
      "Do not hand wash",
      "Do not wring or twist boning",
      "Do not tumble dry",
      "Do not bleach",
      "Dry flat in shade",
      "Steam only on reverse side (do not flat iron)",
    ],
    label: "Corsets",
  },
  {
    items: [
      "Dry clean or hand wash cold separately",
      "Do not soak",
      "Do not wring",
      "Do not tumble dry",
      "Do not bleach",
      "Dry flat in shade",
      "Iron on low heat on the reverse side",
    ],
    label: "Others",
  },
];

export const PAGES = [
  {
    body: `
      ${p(
        "Lorem Ipsum is a Mumbai-based everyday luxury label that blends tailoring with a nonconformist spirit. Designed to transcend seasons and trends, our collections balance femininity, craftsmanship, and wearability.",
        "Every piece is thoughtfully created with a focus on fit, fabric, and finish, becoming a lasting part of an everyday wardrobe.",
      )}
      <h2 id="studio">Studio</h2>
      ${image("/reference/clone/about-craftsmanship.png", "Lorem Ipsum Studio", "Lorem Ipsum Studio")}
      ${p(
        "Lorem Ipsum Studio is a Mumbai-based design practice working across tailoring, corsetry and everyday wear. The studio grew out of a belief that clothing should make space for individuality, and each collection is developed in-house from first sketch to final stitch.",
      )}
      <h2>Brand Philosophy</h2>
      ${VALUES.map(([src, label]) => image(src, label, label)).join("\n")}
      <h2 id="store">Flagship Store</h2>
      ${image(
        "/reference/clone/about-store.png",
        "Lorem Ipsum flagship store in Mumbai",
        "Flagship store, Mumbai",
      )}
      ${p(
        "An extension of the Lorem Ipsum world. A space to experience the collections up close, discover the details and find pieces that become part of your everyday.",
        "123 Example Street, Mumbai, India<br />Monday – Sunday, 11am – 8pm",
      )}
      <h2>Atelier</h2>
      ${image("/reference/clone/about-atelier.png", "Inside the Lorem Ipsum atelier")}
      ${image("/reference/clone/about-studio.png", "Pattern making at the Lorem Ipsum studio")}
      ${p(
        "Where the clothes take shape. Our atelier is where ideas become garments. From the first cut to the final stitch, each piece moves through a considered process of pattern, construction and finishing, bringing together skilled hands, precise craftsmanship and an attention to detail that defines Lorem Ipsum.",
      )}
      <h2>Archive</h2>
      ${ARCHIVE.map(([src, label]) => image(src, label, label)).join("\n")}
      <p>Lorem Ipsum · Mumbai</p>
    `,
    handle: "about-us",
    title: "About Us",
  },
  {
    body: `
      ${p("Lorem Ipsum lookbooks, chapter by chapter.")}
      ${LOOKBOOKS.map(
        (chapter) => `
        <h2 id="${chapter.id}">${chapter.label}</h2>
        ${chapter.shop ? '<p><a href="/collections/chapter-x">Shop the chapter</a></p>' : ""}
        ${chapter.images.map(([src, alt]) => image(src, alt, chapter.label)).join("\n")}
      `,
      ).join("\n")}
    `,
    handle: "lookbooks",
    title: "Lookbooks",
  },
  {
    body: `
      ${p("Lorem Ipsum in the press.")}
      ${PRESS.map(
        (entry) => `
        <h2>${entry.outlet}</h2>
        ${image(entry.image, `${entry.outlet} press feature`)}
        <blockquote>${p(`&ldquo;${entry.quote}&rdquo;`)}</blockquote>
      `,
      ).join("\n")}
    `,
    handle: "press-v2",
    title: "Press",
  },
  {
    body: `
      ${p("Answers about orders, shipping, returns, sizing and care at Lorem Ipsum.")}
      ${FAQS.map(
        ([question, answer]) => `<details><summary>${question}</summary>${p(answer)}</details>`,
      ).join("\n")}
    `,
    handle: "faqs",
    title: "FAQ",
  },
  {
    body: `
      ${image("/reference/clone/care-guide.jpg", "Lorem Ipsum care guide")}
      ${p(
        "Our pieces are designed to be worn, lived in and kept for a long time. Follow the care instructions below to help preserve their shape, colour, texture and finish. For the most accurate instructions, always refer to the care label on your garment.",
      )}
      ${CARE.map((group) => `<h2>${group.label}</h2>${list(group.items)}`).join("\n")}
      ${p("Questions? Write to hello@loremipsum.example or visit the flagship store at 123 Example Street, Mumbai.")}
    `,
    handle: "care-guide",
    title: "Lorem Ipsum Care Guide",
  },
  {
    body: `
      <h2>Domestic orders (within India)</h2>
      ${p(
        "We offer free standard shipping for orders above INR 5,000 across India. A flat fee of INR 100 is charged on orders below INR 5,000. Express shipping charges vary by parcel weight and are available for metro cities. To opt for express shipping, WhatsApp us at +91 90000 00000 or email hello@loremipsum.example. Express requests can be accepted or declined subject to product availability.",
      )}
      <h2>Delivery time frame</h2>
      ${p(
        "Standard orders are typically dispatched within 6–7 business days (Monday–Friday) within India. Express orders arrive within 1–2 business days. If a piece is not readily available, we allow time to restock and a team member will email you about the delay.",
        "Made-to-measure and made-to-order pieces have a standard dispatch window of 1–2 weeks. If you order multiple items, they may be processed in multiple shipments; you will receive a tracking number as each shipment leaves.",
      )}
      <h2>Tracking</h2>
      ${p(
        "Once your order is shipped you will receive a tracking link by email. Use it to follow the status of your delivery with the courier.",
      )}
      <h2>Service delays</h2>
      ${p(
        "Lorem Ipsum is not responsible for unexpected delays caused by bad weather, natural disasters or clearance delays. Contact the courier directly with the tracking number for updates.",
      )}
      <h2>International orders (outside India)</h2>
      ${p(
        "International shipping is approximately $30 (INR 2,500), excluding customs duties levied at the destination. Duties, taxes and import charges are the customer's responsibility; contact your local customs office before ordering if you need an estimate.",
        "International orders are dispatched within 7–10 business days. Delivery timelines vary by destination pincode. If a piece is not readily available, we will email you about the restock delay.",
      )}
      <h2>Failed delivery</h2>
      ${p(
        "Lorem Ipsum is not responsible for charges related to return shipment when delivery fails because of an incorrect address, contact details, repeated failed attempts or refusal to pay customs fees. If the order is returned and must be sent again, shipping fees are payable again.",
      )}
      <h2>Returns &amp; exchanges</h2>
      ${p(
        "We do not accept returns or exchanges on international orders. Domestic returns and exchanges are covered under the returns policy.",
      )}
    `,
    handle: "shipping-returns",
    title: "Shipping & Delivery",
  },
  {
    body: `
      ${p(
        "Return requests must be raised within 14 days of delivery. Approved domestic returns are issued as store credit equivalent to the value of the returned item, redeemable online and in-store. International orders are not eligible for refunds or direct exchanges, except for wrong, damaged or faulty items.",
        "Returns must be shipped on a Delivered Duty Paid (DDP) basis, with all shipping costs, duties and taxes prepaid by the customer. Returned items must reach our designated warehouse for inspection. A ₹250 return shipping fee is deducted from domestic store credit, unless the item is wrong, damaged or faulty.",
      )}
      <h2>Eligibility</h2>
      ${p("To be eligible for a return or exchange, the item must be:")}
      ${list([
        "Unworn and unused",
        "Unwashed",
        "In its original condition",
        "Returned with all original tags attached",
        "Free from makeup, deodorant or other stains",
        "Free from perfume or other strong scents",
        "Free from any signs of wear, alteration or damage",
      ])}
      <h2>Items that cannot be returned</h2>
      ${list([
        "Sale and final-sale items",
        "Archive sale and end-of-season sale items",
        "Items marked as final sale on the website",
        "Customised or personalised orders",
        "Store credit",
        "Items that have been worn, washed, altered or damaged",
        "Items without their original tags",
        "Items with makeup, deodorant or other stains",
        "Items with perfume, body odour or other strong scents",
      ])}
      ${p("All sale orders are final sale and cannot be returned or exchanged.")}
      <h2>Wrong, damaged or faulty items</h2>
      ${p(
        "Email hello@loremipsum.example within 24 hours of delivery, whether the order is domestic or international. Include your order number, photos or videos of the item, photos clearly showing the issue, and photos of the packaging if it arrived damaged. Do not wear, wash or alter the item before contacting us.",
        "Once we review the issue we will arrange a replacement, exchange, store credit or refund depending on the circumstances. Approved refunds are processed within 8–10 business days after we receive and inspect the item.",
      )}
      <h2>How to return or exchange</h2>
      ${list(
        [
          "Submit your request through the contact page with your order number and the item you want to return or exchange.",
          "Wait for approval before sending anything back.",
          "For domestic orders we arrange a courier pickup, usually within 2–3 business days. For international orders the return shipment is organised by the customer on a DDP basis.",
          "Our team checks the item on arrival. The return is approved only if it meets the requirements above.",
        ],
        true,
      )}
      <h2>Store credit</h2>
      ${p(
        "Store credit is valid for six months from issue, cannot be extended, exchanged for cash or transferred to another person. Orders placed using store credit cannot be returned or exchanged unless the item received is wrong, damaged or faulty.",
      )}
      <h2>Order cancellations</h2>
      ${p(
        "Contact us as soon as possible at hello@loremipsum.example with your order number. We may not be able to cancel or change an order once it has been processed or shipped.",
      )}
    `,
    handle: "returns-exchanges",
    title: "Returns & Exchanges",
  },
  {
    body: `
      <h2>Overview</h2>
      ${p(
        "This website is operated by Lorem Ipsum Studio. Throughout the site, the terms “we”, “us” and “our” refer to Lorem Ipsum Studio. We offer this website, including all information, tools and services available from it, conditioned on your acceptance of the terms, conditions, policies and notices stated here.",
        "By visiting our site or purchasing something from us, you engage in our “Service” and agree to be bound by these Terms of Service, including additional terms and policies referenced here or available by hyperlink. Read these terms carefully before using the site.",
        "Our store is hosted on Shopify Inc. They provide the online e-commerce platform that allows us to sell our products and services to you.",
      )}
      <h2>Section 1 — Online store terms</h2>
      ${p(
        "By agreeing to these terms you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorised purpose, and you may not transmit any worms, viruses or destructive code. A breach or violation of these terms will result in immediate termination of your services.",
      )}
      <h2>Section 2 — General conditions</h2>
      ${p(
        "We reserve the right to refuse service to anyone for any reason at any time. Your content (not including credit card information) may be transferred unencrypted and may involve transmissions over networks and changes to conform to technical requirements. Credit card information is always encrypted during transfer. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the service without express written permission.",
      )}
      <h2>Section 3 — Accuracy of information</h2>
      ${p(
        "We are not responsible if information made available on this site is not accurate, complete or current. The material is provided for general information only and should not be relied upon as the sole basis for decisions. Any reliance on the material is at your own risk.",
      )}
      <h2>Section 4 — Modifications to the service and prices</h2>
      ${p(
        "Prices are subject to change without notice. We reserve the right to modify or discontinue the service without notice at any time. We are not liable to you or any third party for any modification, price change, suspension or discontinuance of the service.",
      )}
      <h2>Section 5 — Products or services</h2>
      ${p(
        "Certain products may be available exclusively online and may have limited quantities. They are subject to return or exchange only according to our returns policy. We have made every effort to display colours and images accurately, but we cannot guarantee that your monitor displays every colour accurately.",
        "We reserve the right to limit sales to any person, geographic region or jurisdiction, and to limit quantities. Descriptions and pricing are subject to change without notice. Any offer for a product or service is void where prohibited.",
      )}
      <h2>Section 6 — Billing and account information</h2>
      ${p(
        "We reserve the right to refuse or limit any order. We may cancel an order and attempt to notify you using the e-mail, billing address or phone number provided. You agree to provide current, complete and accurate purchase and account information and to update it promptly.",
      )}
      <h2>Sections 7–10 — Tools, links, comments and privacy</h2>
      ${p(
        "We may provide access to third-party tools without monitoring or control. They are provided “as is” and “as available” without warranties or endorsement, and you use them at your own risk. Third-party links may direct you to websites that are not affiliated with us; review their policies before engaging.",
        "If you send comments or submissions, you agree that we may edit, copy, publish, distribute and otherwise use them in any medium without restriction or compensation. We may monitor, edit or remove content that we determine is unlawful, offensive or violates another party's rights. Your submission of personal information is governed by our Privacy Policy.",
      )}
      <h2>Sections 11–13 — Errors, prohibited uses, liability</h2>
      ${p(
        "We reserve the right to correct errors, inaccuracies or omissions and to change or update information or cancel orders if information is inaccurate at any time without prior notice. You are prohibited from using the site for unlawful purposes, to violate laws, to infringe rights, to harass or discriminate, to submit false information, to upload malicious code, to collect or track the personal information of others, to spam or phish, or to interfere with security features.",
        "Your use of the service is at your sole risk. The service and all products are provided “as is” and “as available,” without warranties of any kind, express or implied. In no case shall Lorem Ipsum Studio, its directors, officers, employees, affiliates, agents, contractors, suppliers or licensors be liable for any injury, loss, claim or direct, indirect, incidental, punitive, special or consequential damages arising from your use of the service or any product.",
      )}
      <h2>Sections 14–20 — Indemnification to contact</h2>
      ${p(
        "You agree to indemnify and hold harmless Lorem Ipsum Studio and its affiliates, partners, officers, directors, agents, contractors, licensors, service providers and employees from any claim or demand, including reasonable attorneys' fees, arising from your breach of these terms or violation of any law or third-party right.",
        "If any provision is found unlawful, void or unenforceable, that portion is severed and the remaining provisions stay in effect. These terms are effective until terminated by you or us. You may terminate by notifying us or by ceasing to use the site. We may terminate if you fail to comply.",
        "These terms and any policies posted on this site constitute the entire agreement between you and us. They are governed by the laws of India. We may update these terms by posting changes on this page. Questions may be sent to legal@loremipsum.example.",
      )}
    `,
    handle: "terms-of-service",
    title: "Terms of Service",
  },
  {
    body: `
      ${p(
        "Lorem Ipsum is a Mumbai-based fashion and lifestyle brand operated by Lorem Ipsum Studio (“Lorem Ipsum”, “we”, “us” or “our”). This policy explains how we collect, use, store, disclose and otherwise process personal information when you visit or purchase through www.loremipsum.example, contact customer support or otherwise engage with our services.",
        "By accessing or using the website you acknowledge that you have read and understood this policy.",
      )}
      <h2>1. Who we are</h2>
      ${p(
        "Lorem Ipsum is operated by Lorem Ipsum Studio, 123 Example Street, Mumbai, India. Email: legal@loremipsum.example. Website: www.loremipsum.example. Lorem Ipsum Studio determines how and why personal information is processed.",
      )}
      <h2>2. Personal information we collect</h2>
      ${p(
        "When you place an order, create an account, contact us, subscribe to communications, request a return or exchange, use store credit, participate in a promotion or otherwise interact with us, we may collect your name, email address, phone number, billing and shipping addresses, payment and transaction information, order history, return and exchange information, store credit information, customer service correspondence and information you voluntarily provide through forms or messages.",
        "We do not generally store complete payment card details ourselves. Payments may be processed by third-party gateways and payment service providers under their own privacy policies.",
        "When you visit the website we may automatically collect IP address, browser and device information, time zone, approximate location, language preferences, pages and products viewed, search queries, referring and exit pages, visit times, interaction information and cookie data (“Device Information”).",
      )}
      <h2>3. Cookies, pixels and similar technologies</h2>
      ${p(
        "We use cookies, pixels, tags, web beacons and similar technologies to keep the site functioning, remember cart items and preferences, understand traffic and usage, analyse browsing, measure advertising performance, provide relevant marketing, improve functionality and security, and detect fraud. You can control cookies through your browser or device settings; disabling some cookies may affect site features.",
      )}
      <h2>4. How we use personal information</h2>
      ${p(
        "We use personal information to process orders and payments, arrange shipping and delivery, provide invoices and confirmations, process returns, exchanges, refunds and store credit, communicate about orders and support, respond to enquiries, send marketing communications where permitted, improve the website and business, understand customer preferences, measure marketing effectiveness, prevent fraud, protect our business and comply with legal obligations.",
      )}
      <h2>5. How we share personal information</h2>
      ${p(
        "We do not sell personal information as a standalone commercial product. We may share it with e-commerce and technology providers including Shopify, payment providers, shipping and logistics providers, analytics and advertising providers including Google Analytics, customer service and communication providers, professional advisers, legal and regulatory authorities where required, and in connection with a business transfer.",
      )}
      <h2>6. International transfers and retention</h2>
      ${p(
        "Some providers may process personal information outside India. Where information is transferred outside India we take reasonable steps to ensure processing complies with applicable data protection laws. If you are outside India, including in the EEA or UK, your information may be transferred to and processed in India and other countries where our providers operate.",
        "We retain personal information only as long as reasonably necessary to complete transactions, provide support, manage returns and credit, maintain business and financial records, meet legal and regulatory requirements, resolve disputes, prevent fraud and enforce agreements. When it is no longer required we may delete, anonymise or securely dispose of it.",
      )}
      <h2>7. Your privacy rights</h2>
      ${p(
        "Depending on your location and applicable law, you may have the right to request information about the personal information we process, correct inaccurate information, request deletion where applicable, withdraw consent, raise a grievance, opt out of marketing and exercise other rights available under law.",
        "For individuals whose personal information is governed by India's Digital Personal Data Protection framework, applicable rights will be provided in accordance with the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 as they come into force. Exercise rights by writing to legal@loremipsum.example. We may need to verify your identity before processing certain requests.",
      )}
      <h2>8. Marketing communications</h2>
      ${p(
        "If you opt in, we may contact you by email, SMS, WhatsApp or other channels for which you provided contact information. You can unsubscribe using the instructions in the communication or by writing to legal@loremipsum.example. Opting out does not prevent essential transactional or service messages such as order, payment, shipping, return or exchange updates.",
      )}
      <h2>9–14. Third parties, children, do not track, security and changes</h2>
      ${p(
        "Our website may link to third-party sites and services. We are not responsible for their privacy practices, security or content; review their policies before providing personal information. Our site is intended for a general audience and we do not knowingly collect personal information from children where prohibited by law.",
        "Some browsers offer a “Do Not Track” setting. Because there is no universally accepted standard, our site may not respond to all such signals. We take reasonable technical and organisational measures to protect personal information, but no method of electronic transmission or storage is completely secure. If we become aware of a personal data breach we will investigate, contain and mitigate it and notify affected individuals or authorities where required by law.",
        "We may update this policy to reflect changes to our business, website, technology, providers, laws or practices. We will update the “Last Updated” date when changes are made. Review the policy periodically.",
      )}
      <h2>15. Contact us</h2>
      ${p(
        "Questions about this policy, privacy rights or grievances: Lorem Ipsum Studio, 123 Example Street, Mumbai, India. Email: legal@loremipsum.example. Website: www.loremipsum.example. We will review and respond within the time periods required by applicable law.",
        "© Lorem Ipsum Studio. All rights reserved.",
      )}
    `,
    handle: "privacy-policies",
    title: "Privacy Policies",
  },
];
