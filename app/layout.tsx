import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Earn Auto-Reviewer | AI-Powered Code Reviews",
  description: "Get expert code reviews in seconds. 8 AI judges analyze your GitHub PRs and repositories with detailed scoring, actionable feedback, and comprehensive reports.",
  keywords: ["code review", "AI", "GitHub", "Superteam", "Earn", "Solana", "automated review"],
  authors: [{ name: "RECTOR-LABS" }],
  openGraph: {
    title: "Earn Auto-Reviewer | AI-Powered Code Reviews",
    description: "Get expert code reviews in seconds. 8 AI judges analyze your GitHub PRs and repositories.",
    type: "website",
    url: "https://earn-auto-review.rectorspace.com",
    siteName: "Earn Auto-Reviewer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earn Auto-Reviewer | AI-Powered Code Reviews",
    description: "Get expert code reviews in seconds. 8 AI judges analyze your GitHub PRs and repositories.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
