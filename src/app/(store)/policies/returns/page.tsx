import type { Metadata } from "next";
import { ContactLine, PolicyPage } from "@/components/store/PolicyPage";

export const metadata: Metadata = { title: "Returns & refunds" };

export default function ReturnsPolicy() {
  return (
    <PolicyPage
      path="/policies/returns"
      title="Returns & refunds"
      intro="Most of our pieces are made to order in the wood, polish and fabric you choose, so our return terms reflect that."
      sections={[
        {
          heading: "Cancelling an order",
          body: (
            <p>
              You can cancel an order from My account → Orders while it is still pending. Once production has started on a made-to-order piece, the order
              can no longer be cancelled.
            </p>
          ),
        },
        {
          heading: "Made-to-order and customised pieces",
          body: <p>Pieces made in your chosen options are not returnable unless they arrive damaged or defective.</p>,
        },
        {
          heading: "Damaged or defective items",
          body: (
            <p>
              Tell us within 48 hours of delivery, with photos of the item and its packaging. We will arrange a repair, a replacement or a refund at no cost
              to you.
            </p>
          ),
        },
        {
          heading: "Refunds",
          body: <p>Approved refunds are made to the original payment method within 7–10 working days. Cash on delivery orders are refunded by bank transfer.</p>,
        },
        {
          heading: "Natural materials",
          body: (
            <p>
              Solid wood and hand-woven cane vary naturally in grain, tone and weave. Small differences from photos are part of each piece’s character, not
              defects.
            </p>
          ),
        },
        {
          heading: "Questions",
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
