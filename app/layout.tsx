import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxBox",
  description: "Secure tax-document intake for accounting firms"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
