import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // FIXME: The language of the content is English, but I leave it for now
    // to preserve the appearance.
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
