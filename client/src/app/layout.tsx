import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { StoreFrame } from "@/components/layout/store-frame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Morrow — considered goods", template: "%s | Morrow" },
  description: "A thoughtful edit of everyday goods from independent sellers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${serif.variable} antialiased`} data-scroll-behavior="smooth">
      <body>
        <Providers>
          <StoreFrame>{children}</StoreFrame>
        </Providers>
      </body>
    </html>
  );
}
