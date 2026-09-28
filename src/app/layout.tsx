import type { Metadata } from "next";
import "./calm-portfolio.css";

export const metadata: Metadata = {
  title: "Charles Xander Panis | Full Stack Developer",
  description:
    "Full stack developer building practical tools for research and education. Explore RRL Finder, Tabulora, OJTonTrack, Iguide, and CARW.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="relative min-h-full">
        {children}
      </body>
    </html>
  );
}
