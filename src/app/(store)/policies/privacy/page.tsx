import type { Metadata } from "next";
import { ContactLine, PolicyPage } from "@/components/store/PolicyPage";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <PolicyPage
      path="/policies/privacy"
      title="Privacy policy"
      intro={`This policy explains what personal information ${BUSINESS.brand} collects, why, and how you can control it.`}
      sections={[
        {
          heading: "What we collect",
          body: (
            <ul>
              <li>Account details: your name, email address and phone number.</li>
              <li>Order details: delivery addresses, items ordered and payment method.</li>
              <li>Reviews and wishlist items you choose to save.</li>
              <li>Basic technical data, such as browser type, needed to keep the site working and secure.</li>
            </ul>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul>
              <li>To process, deliver and support your orders.</li>
              <li>To manage your account and keep it secure.</li>
              <li>To answer your questions and send updates about your orders.</li>
            </ul>
          ),
        },
        {
          heading: "Who we share it with",
          body: (
            <p>
              Only with the services needed to run the store, such as hosting, database, delivery and payment providers, and only what they need to do
              their job. We do not sell your personal information.
            </p>
          ),
        },
        {
          heading: "Signing in with Google",
          body: <p>If you sign in with Google, we receive your name, email address and profile photo from Google. We never receive your Google password.</p>,
        },
        {
          heading: "Cookies",
          body: <p>We use essential cookies to keep you signed in, and browser storage to remember your bag. We do not use advertising cookies.</p>,
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can update your profile and addresses under My account at any time. To request a copy or deletion of your data, contact us and we will
              respond within 30 days.
            </p>
          ),
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
