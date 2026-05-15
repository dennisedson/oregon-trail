import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dennis Edson | The Anthropic Trail",
  description: "Dennis Edson's Oregon Trail-style interactive candidate agent."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${vt323.variable} font-trail`}>{children}</body>
    </html>
  );
}
