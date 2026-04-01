import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pool Service App",
  description: "Operations management platform for pool service companies and resort teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
