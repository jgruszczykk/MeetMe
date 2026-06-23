import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetMe — Book a meeting",
  description: "Schedule meetings with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geist.variable} h-full bg-[#07050f]`}>
      <body className="min-h-full bg-[#07050f] antialiased">
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
