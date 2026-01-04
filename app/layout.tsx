import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Gonana Marketplace",
  description: "Empowering Agriculture Through Technology",
};

import { WalletProvider } from "@/context/WalletContext";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          inter.variable,
          merriweather.variable
        )}
      >
        <NextAuthProvider>
          <WalletProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WalletProvider>
        </NextAuthProvider>
        {/* Paystack Inline Script */}
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </body>
    </html>
  );
}
