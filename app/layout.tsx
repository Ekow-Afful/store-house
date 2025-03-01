import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppin = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  preload: true,
});

export const metadata: Metadata = {
  title: "StoreHouse",
  description: "StoreHouse - A Simple storage for your storage needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppin.variable} font-poppins antialiased`}>
        {children}
      </body>
    </html>
  );
}
