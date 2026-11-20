import type { Metadata } from "next";
import "./calm-portfolio.css";

const title = "Charles Xander Panis | Full Stack Developer";
const description =
  "Full stack developer building practical tools for research and education. Explore RRL Finder, Wash & Fold, Tabulora, Zentra, ARMS, and OJTonTrack.";

// Share images need a full address. On Vercel this is the production domain;
// set NEXT_PUBLIC_SITE_URL to override it (for example on another host).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

// The icon and the share image come from icon.svg and opengraph-image.png beside this file.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { type: "website", siteName: "Charles Xander Panis", title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
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
