import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "kannectt — AI-powered job outreach",
  description: "Upload your resume once. Our AI personalises every cold email for every company. Land interviews faster with 300 free credits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0A0B] text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
