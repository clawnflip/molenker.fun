import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "molenker.fun 🦞 - Launch Tokens on Base",
  description: "The #1 token launchpad on Base. Deploy your token in seconds and earn 90% of trading fees. 🦞",
  keywords: ["base", "token", "launchpad", "crypto", "meme", "clanker"],
  openGraph: {
    title: "molenker.fun 🦞",
    description: "Launch your token on Base in seconds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
