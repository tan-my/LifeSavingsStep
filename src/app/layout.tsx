import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Lets Next resolve relative URLs in metadata (canonical, Open Graph) against
  // the real origin rather than emitting relative ones a crawler can't follow.
  metadataBase: new URL(SITE_URL),
  title: "LifeSavingsStep",
  description:
    "Plan and track the money needed to live, year by year — a personal savings timeline.",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">{children}</body>
    </html>
  );
}
