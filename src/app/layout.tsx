import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Albert",
  description: "Training app for Munsell color system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
