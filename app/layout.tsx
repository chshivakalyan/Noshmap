import type { Metadata } from "next";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "noshMap - Remember every great meal",
  description:
    "Discover, log, rate and remember the food you eat with noshMap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
