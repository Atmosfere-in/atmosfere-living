import type { Metadata } from "next";
import { ContactLine, PolicyPage } from "@/components/store/PolicyPage";
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD, inr } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping & delivery" };

export default function ShippingPolicy() {
  return (
    <PolicyPage
      path="/policies/shipping"
      title="Shipping & delivery"
      intro="How and when your order reaches you. Each product page also shows its own delivery time."
      sections={[
        {
          heading: "Where we deliver",
          body: <p>We deliver across India. Remote locations may take longer; we will let you know after you order.</p>,
        },
        {
          heading: "Delivery times",
          body: (
            <p>
              Orders are usually dispatched in 5–7 working days and reach you 3–5 working days after dispatch, depending on your city. Each product page shows
              its delivery time.
            </p>
          ),
        },
        {
          heading: "Shipping charges",
          body: (
            <p>
              Shipping is complimentary on orders of {inr(FREE_SHIPPING_THRESHOLD)} or more. Orders below that carry a flat fee of {inr(FLAT_SHIPPING)},
              shown at checkout before you pay.
            </p>
          ),
        },
        {
          heading: "Tracking your order",
          body: <p>Follow your order status under My account → Orders. Once dispatched, the tracking number appears there.</p>,
        },
        {
          heading: "Receiving your order",
          body: (
            <p>
              Please check your order when it arrives. If anything is damaged or missing, note it on the delivery receipt and tell us within 48 hours with
              photos so we can put it right.
            </p>
          ),
        },
        {
          heading: "Questions",
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
