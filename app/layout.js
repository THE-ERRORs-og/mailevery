import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initServer } from "@/lib/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize server components
// initServer();

export const metadata = {
  title: "Email Service",
  description: "API-driven email service platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
