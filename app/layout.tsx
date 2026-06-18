import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dennis Edson's Developer Trail",
  description: "Dennis Edson's Oregon Trail-style interactive candidate agent."
};

const gaMeasurementId = "G-W8PS9PZ6SR";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${vt323.variable} font-trail`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
