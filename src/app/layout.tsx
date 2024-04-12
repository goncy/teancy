import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Teancy",
  description:
    "Create balanced teams for all things. Add players to the roster, select the ones you want to include, and let Teancy do the rest.",
  keywords: [
    "team",
    "balance",
    "create",
    "teancy",
    "football team builder",
    "balanced teams maker",
    "balanced teams creator",
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="dark container m-auto grid min-h-screen max-w-screen-md grid-rows-[auto,1fr,auto] bg-background px-4 font-sans antialiased">
        <header className="text-xl font-bold leading-[4rem]">
          <Link href="/">🤝 Teancy</Link>
        </header>
        <main className="py-0 sm:py-8">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          Made with 🖤 and Next.js by Goncy
        </footer>
      </body>
    </html>
  );
}
