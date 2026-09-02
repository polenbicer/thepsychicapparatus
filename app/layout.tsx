import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Psychic Apparatus",
  description: "A completely unlicensed analysis of you, Polen, and her phone.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
