import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const serif = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });
const sans = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://atmosfere-living.in"),
  title: {
    default: "Atmosfere Living — Curated Furniture & Home Decor",
    template: "%s · Atmosfere Living",
  },
  description:
    "Curated furniture, lighting and decor from Atmosfere — styled corner by corner. Shop pieces chosen by the designers behind Atmosfere Spaces.",
  openGraph: { siteName: "Atmosfere Living", type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} antialiased`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
