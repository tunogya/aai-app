import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ReactNode } from "react";
import Link from "next/link";
import "cal-sans";
import "./styles/globals.css";
import "./styles/katex.min.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const title = "AbandonAI";
const description = "Powered by OpenAI";

export const metadata: Metadata = {
  title,
  description,
  viewport:
    "width=device-width, initial-scale=1, shrink-to-fit=no,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
  applicationName: "AbandonAI",
  metadataBase: new URL(process.env.AUTH0_BASE_URL!),
  themeColor: "#fff",
  openGraph: {
    images: "/favicon.svg",
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@abandonai",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "AbandonAI",
  },
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <UserProvider>
        <body className={`h-full w-full`}>
          <Link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          />
          <Script
            src={"https://www.googletagmanager.com/gtag/js?id=G-HT9Q8GW970"}
          />
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', 'G-HT9Q8GW970');
              `}
          </Script>
          <TailwindIndicator />
          {props.children}
        </body>
      </UserProvider>
    </html>
  );
}
