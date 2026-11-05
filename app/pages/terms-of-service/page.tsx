import type { Metadata } from "next";

import { ContentPage, ContentSection } from "@/components/content/content-page";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/pages/terms-of-service" }),
  description: "The terms that apply to purchases from Polite Society.",
  openGraph: buildOpenGraph({
    description: "The terms that apply to purchases from Polite Society.",
    title: "Terms of Service",
    type: "website",
    url: "/pages/terms-of-service",
  }),
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Service">
      <ContentSection heading="Overview">
        <p>
          This website is operated by politesocietyshop. Throughout the site, the terms “we”, “us”
          and “our” refer to politesocietyshop. We offer this website, including all information,
          tools and services available from it, conditioned on your acceptance of the terms,
          conditions, policies and notices stated here.
        </p>
        <p>
          By visiting our site or purchasing something from us, you engage in our “Service” and
          agree to be bound by these Terms of Service, including additional terms and policies
          referenced here or available by hyperlink. Read these terms carefully before using the
          site.
        </p>
        <p>
          Our store is hosted on Shopify Inc. They provide the online e-commerce platform that
          allows us to sell our products and services to you.
        </p>
      </ContentSection>

      <ContentSection heading="Section 1 — Online store terms">
        <p>
          By agreeing to these terms you represent that you are at least the age of majority in your
          state or province of residence. You may not use our products for any illegal or
          unauthorised purpose, and you may not transmit any worms, viruses or destructive code. A
          breach or violation of these terms will result in immediate termination of your services.
        </p>
      </ContentSection>

      <ContentSection heading="Section 2 — General conditions">
        <p>
          We reserve the right to refuse service to anyone for any reason at any time. Your content
          (not including credit card information) may be transferred unencrypted and may involve
          transmissions over networks and changes to conform to technical requirements. Credit card
          information is always encrypted during transfer. You agree not to reproduce, duplicate,
          copy, sell, resell or exploit any portion of the service without express written
          permission.
        </p>
      </ContentSection>

      <ContentSection heading="Section 3 — Accuracy of information">
        <p>
          We are not responsible if information made available on this site is not accurate,
          complete or current. The material is provided for general information only and should not
          be relied upon as the sole basis for decisions. Any reliance on the material is at your
          own risk.
        </p>
      </ContentSection>

      <ContentSection heading="Section 4 — Modifications to the service and prices">
        <p>
          Prices are subject to change without notice. We reserve the right to modify or discontinue
          the service without notice at any time. We are not liable to you or any third party for
          any modification, price change, suspension or discontinuance of the service.
        </p>
      </ContentSection>

      <ContentSection heading="Section 5 — Products or services">
        <p>
          Certain products may be available exclusively online and may have limited quantities. They
          are subject to return or exchange only according to our returns policy. We have made every
          effort to display colours and images accurately, but we cannot guarantee that your monitor
          displays every colour accurately.
        </p>
        <p>
          We reserve the right to limit sales to any person, geographic region or jurisdiction, and
          to limit quantities. Descriptions and pricing are subject to change without notice. Any
          offer for a product or service is void where prohibited.
        </p>
      </ContentSection>

      <ContentSection heading="Section 6 — Billing and account information">
        <p>
          We reserve the right to refuse or limit any order. We may cancel an order and attempt to
          notify you using the e-mail, billing address or phone number provided. You agree to
          provide current, complete and accurate purchase and account information and to update it
          promptly.
        </p>
      </ContentSection>

      <ContentSection heading="Sections 7–10 — Tools, links, comments and privacy">
        <p>
          We may provide access to third-party tools without monitoring or control. They are
          provided “as is” and “as available” without warranties or endorsement, and you use them at
          your own risk. Third-party links may direct you to websites that are not affiliated with
          us; review their policies before engaging.
        </p>
        <p>
          If you send comments or submissions, you agree that we may edit, copy, publish, distribute
          and otherwise use them in any medium without restriction or compensation. We may monitor,
          edit or remove content that we determine is unlawful, offensive or violates another
          party&apos;s rights. Your submission of personal information is governed by our Privacy
          Policy.
        </p>
      </ContentSection>

      <ContentSection heading="Sections 11–13 — Errors, prohibited uses, liability">
        <p>
          We reserve the right to correct errors, inaccuracies or omissions and to change or update
          information or cancel orders if information is inaccurate at any time without prior
          notice. You are prohibited from using the site for unlawful purposes, to violate laws, to
          infringe rights, to harass or discriminate, to submit false information, to upload
          malicious code, to collect or track the personal information of others, to spam or phish,
          or to interfere with security features.
        </p>
        <p>
          Your use of the service is at your sole risk. The service and all products are provided
          “as is” and “as available,” without warranties of any kind, express or implied. In no case
          shall politesocietyshop, its directors, officers, employees, affiliates, agents,
          contractors, suppliers or licensors be liable for any injury, loss, claim or direct,
          indirect, incidental, punitive, special or consequential damages arising from your use of
          the service or any product.
        </p>
      </ContentSection>

      <ContentSection heading="Sections 14–20 — Indemnification to contact">
        <p>
          You agree to indemnify and hold harmless politesocietyshop and its affiliates, partners,
          officers, directors, agents, contractors, licensors, service providers and employees from
          any claim or demand, including reasonable attorneys&apos; fees, arising from your breach
          of these terms or violation of any law or third-party right.
        </p>
        <p>
          If any provision is found unlawful, void or unenforceable, that portion is severed and the
          remaining provisions stay in effect. These terms are effective until terminated by you or
          us. You may terminate by notifying us or by ceasing to use the site. We may terminate if
          you fail to comply.
        </p>
        <p>
          These terms and any policies posted on this site constitute the entire agreement between
          you and us. They are governed by the laws of India. We may update these terms by posting
          changes on this page. Questions may be sent to surmaijain@gmail.com.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
