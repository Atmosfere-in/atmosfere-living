import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, PolicyPage } from "@/components/store/PolicyPage";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  const operator = BUSINESS.legalName || BUSINESS.brand;
  return (
    <PolicyPage
      path="/policies/terms"
      title="Terms of use"
      intro={`These terms apply when you browse or buy from ${BUSINESS.brand}, operated by ${operator}. By using the site or placing an order, you agree to them.`}
      sections={[
        {
          heading: "Your account",
          body: <p>Keep your sign-in details private. You are responsible for orders placed from your account. We may suspend accounts that misuse the site.</p>,
        },
        {
          heading: "Products and prices",
          body: (
            <p>
              Prices are in Indian rupees and include GST. We show every product as accurately as we can, but colours and textures can look different on
              screens. If a price is listed in error, we may cancel the order and refund any amount paid.
            </p>
          ),
        },
        {
          heading: "Orders",
          body: (
            <p>
              An order is confirmed once we accept it and update its status. We may decline or cancel an order if a product is unavailable or details cannot
              be verified.
            </p>
          ),
        },
        {
          heading: "Delivery, returns and refunds",
          body: (
            <p>
              See our <Link href="/policies/shipping">shipping policy</Link> and <Link href="/policies/returns">returns policy</Link>.
            </p>
          ),
        },
        {
          heading: "Designs and content",
          body: <p>Product designs, photos and text on this site belong to Atmosfere and may not be copied or reused without permission.</p>,
        },
        {
          heading: "Liability",
          body: <p>To the extent the law allows, our liability for any order is limited to the amount paid for that order.</p>,
        },
        {
          heading: "Governing law",
          body: <p>These terms are governed by the laws of {BUSINESS.jurisdiction}.</p>,
        },
        {
          heading: "Contact",
          needsContact: true,
          body: (
            <p>
              <ContactLine />
            </p>
          ),
        },
      ]}
    />
  );
}
