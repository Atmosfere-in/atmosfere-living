import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

// Self-hosted (OFL) so builds never depend on fetching Google Fonts.
const serif = localFont({
  src: "./fonts/Marcellus-Regular-latin.woff2",
  variable: "--font-marcellus",
  weight: "400",
  display: "swap",
});
const sans = localFont({
  src: "./fonts/Jost-Variable-latin.woff2",
  variable: "--font-jost",
  weight: "300 500",
  display: "swap",
});

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
