import type { Metadata } from "next";

import { GeistSans } from "geist/font/sans";

import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  title: "Eco Coach",
  description: "Eco Coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(GeistSans.className, "antialiased container px-3 py-8")}
      >
        {children}
      </body>
    </html>
  );
}
