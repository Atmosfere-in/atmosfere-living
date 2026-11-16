import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/PolicyPage";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us" };

export default function Contact() {
  const details = [
    ["Email", BUSINESS.email && <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>],
    ["Phone", BUSINESS.phone && <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>],
    ["Address", BUSINESS.address],
    ["Business", BUSINESS.legalName],
    ["GSTIN", BUSINESS.gstin],
    ["Hours", BUSINESS.hours],
  ].filter(([, v]) => v) as [string, React.ReactNode][];

  return (
    <PolicyPage
      path="/contact"
      title="Contact us"
      intro="Questions about a piece, an order or a custom finish? We’re happy to help."
      sections={[
        {
          heading: "Get in touch",
          body: (
            <>
              {!BUSINESS.email && !BUSINESS.phone && <p>Our support email and phone number will be listed here shortly.</p>}
              <dl className="space-y-2">
                {details.map(([k, v]) => (
                  <div key={k} className="flex gap-4">
                    <dt className="w-24 shrink-0 text-ink">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ),
        },
        {
          heading: "About an order",
          body: <p>Please mention your order number. You can find it under My account → Orders.</p>,
        },
      ]}
    />
  );
}
